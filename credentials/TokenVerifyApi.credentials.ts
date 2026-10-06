import type {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class TokenVerifyApi implements ICredentialType {
  name = 'tokenVerifyApi';
  displayName = 'TokenVerify API';
  documentationUrl = 'https://tokenverifyapi.com';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Your TokenVerify API Key. Leave empty for the free sandbox tier (50 requests). Upgrade to Starter / Builder ($29/mo) at https://tokenverifyapi.com/#pricing.',
    },
    {
      displayName: 'Developer Email',
      name: 'email',
      type: 'string',
      default: '',
      placeholder: 'you@company.com',
      description: 'Optional work email. Automatically unlocks 100 free verifications without a credit card.',
    },
  ];
}
