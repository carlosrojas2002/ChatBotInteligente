import boto3
import time
import sys

# Configuration
BOT_NAME = 'ChatBotInteligente'
DESCRIPTION = 'Bot para TostiCafe'
ROLE_ARN = 'arn:aws:iam::655765967000:role/aws-service-role/lexv2.amazonaws.com/AWSServiceRoleForLexV2Bots_Custom' # Needs to be verified or created, but usually exists
# If role doesn't exist, we might need to create it or let Lex create it via console? 
# Boto3 create_bot requires a roleArn. 
# For now, I'll try to find an existing role or list roles to pick one.
# OR easier: I can search for the role used by the OTHER bot.

def get_lex_role():
    iam = boto3.client('iam')
    try:
        # Check standard service role
        role = iam.get_role(RoleName='AWSServiceRoleForLexV2Bots')
        return role['Role']['Arn']
    except:
        # If standard role not found, try to look for roles used by other bots if possible or just hardcode a common one
        # Assuming the user has one since they have another bot.
        # Let's try to list bots to see what role they use? modify this script to just take a role as arg?
        # Better: use a hardcoded role ARN pattern if we know the account.
        pass
    return None

def create_bot(bot_name):
    lex = boto3.client('lexv2-models', region_name='us-east-1')
    
    # Check if exists
    path_bots = lex.list_bots()
    for bot in path_bots['botSummaries']:
        if bot['botName'] == bot_name:
            print(f"Bot {bot_name} already exists. ID: {bot['botId']}")
            return bot['botId']

    # We need a role. I'll search for the role of the existing 'ChatBotServidores' bot (ID: X3ADVBRCTQ)
    try:
        existing_bot = lex.describe_bot(botId='X3ADVBRCTQ')
        role_arn = existing_bot['roleArn']
    except:
        print("Could not find existing bot to copy role. Using default guess.")
        role_arn = f"arn:aws:iam::{boto3.client('sts').get_caller_identity()['Account']}:role/aws-service-role/lexv2.amazonaws.com/AWSServiceRoleForLexV2Bots"

    print(f"Creating bot {bot_name} with role {role_arn}...")
    
    response = lex.create_bot(
        botName=bot_name,
        description=DESCRIPTION,
        roleArn=role_arn,
        dataPrivacy={'childDirected': False},
        idleSessionTTLInSeconds=300
    )
    
    bot_id = response['botId']
    print(f"Bot created. ID: {bot_id}")
    
    # Wait for available
    while True:
        status = lex.describe_bot(botId=bot_id)['botStatus']
        if status == 'Available':
            break
        time.sleep(2)
        
    # Create Locale
    print("Creating locale es_ES...")
    lex.create_bot_locale(
        botId=bot_id,
        botVersion='DRAFT',
        localeId='es_ES',
        nluIntentConfidenceThreshold=0.40
    )
    
    # Wait for locale
    while True:
        status = lex.describe_bot_locale(botId=bot_id, botVersion='DRAFT', localeId='es_ES')['botLocaleStatus']
        if status in ['Built', 'NotBuilt', 'ReadyExpressTesting']: # NotBuilt is fine, means ready for intents
            break
        time.sleep(2)
        
    return bot_id

if __name__ == "__main__":
    bot_id = create_bot(BOT_NAME)
    print(f"BOT_ID={bot_id}")
