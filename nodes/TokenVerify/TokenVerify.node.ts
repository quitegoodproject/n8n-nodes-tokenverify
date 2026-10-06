import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export class TokenVerify implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'TokenVerify',
    name: 'tokenVerify',
    icon: 'file:tokenverify.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{"Verify: " + $parameter["email"]}}',
    description: 'Sub-50ms VAT checksum validation, disposable email detection, and B2B checkout trust verification.',
    defaults: {
      name: 'TokenVerify',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'tokenVerifyApi',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Business Email',
        name: 'email',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'billing@enterprise.de',
        description: 'The business email address to verify for disposable domains, MX records, and corporate reputation',
      },
      {
        displayName: 'Additional Verification Fields',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            displayName: 'VAT / Tax Registration Number',
            name: 'tax_id',
            type: 'string',
            default: '',
            placeholder: 'DE811123456 or GB123456789',
            description: 'European, UK, or Australian tax registration string to validate against ISO 7064 & Modulo 97 checksum algorithms',
          },
          {
            displayName: 'Two-Letter Country Code',
            name: 'country_code',
            type: 'string',
            default: '',
            placeholder: 'DE, GB, FR, US',
            description: 'Two-letter ISO country code to anchor VAT and jurisdiction rules',
          },
          {
            displayName: 'Phone Number (E.164)',
            name: 'phone',
            type: 'string',
            default: '',
            placeholder: '+447911123456',
            description: 'Phone number to verify for carrier line type, VoIP risk, and toll fraud scoring',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    let credentials: IDataObject | undefined;
    try {
      credentials = (await this.getCredentials('tokenVerifyApi')) as IDataObject;
    } catch {
      credentials = undefined;
    }

    const apiKey = (credentials?.apiKey as string | undefined)?.trim() || '';
    const email = (credentials?.email as string | undefined)?.trim() || '';

    for (let i = 0; i < items.length; i++) {
      try {
        const rawEmail = this.getNodeParameter('email', i) as string;
        const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

        if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.includes('@')) {
          throw new NodeOperationError(
            this.getNode(),
            `A valid business email address is required at index ${i}: "${rawEmail}".`,
            { itemIndex: i },
          );
        }

        const headers: IDataObject = {
          'Content-Type': 'application/json',
          'User-Agent': 'n8n-nodes-tokenverify/0.1.0',
        };

        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }
        if (email) {
          headers['X-Developer-Email'] = email;
        }

        // Construct clean payload, omitting empty optional fields
        const requestPayload: IDataObject = {
          email: rawEmail.trim().toLowerCase(),
        };

        const taxId = (additionalOptions.tax_id as string | undefined)?.trim();
        if (taxId) {
          requestPayload.tax_id = taxId.toUpperCase();
        }

        const countryCode = (additionalOptions.country_code as string | undefined)?.trim();
        if (countryCode) {
          requestPayload.country_code = countryCode.toUpperCase();
        }

        const phone = (additionalOptions.phone as string | undefined)?.trim();
        if (phone) {
          requestPayload.phone = phone;
        }

        const requestOptions: IHttpRequestOptions = {
          method: 'POST',
          url: 'https://tokenverifyapi.com/v1/verify/b2b-lead',
          headers,
          body: requestPayload,
          json: true,
        };

        let responseData: IDataObject;
        try {
          responseData = await this.helpers.httpRequest(requestOptions);
        } catch (error: any) {
          if (error.statusCode === 429) {
            throw new NodeApiError(this.getNode(), error, {
              message: 'TokenVerify sandbox quota exhausted. Claim 100 free verifications at https://tokenverifyapi.com/claim or upgrade to the Starter / Builder tier ($29/mo) at https://tokenverifyapi.com/#pricing.',
              httpCode: '429',
              itemIndex: i,
            });
          }
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        }

        const executionItem: INodeExecutionData = {
          json: {
            ...responseData,
          },
          pairedItem: {
            item: i,
          },
        };

        returnData.push(executionItem);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: {
              item: i,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
