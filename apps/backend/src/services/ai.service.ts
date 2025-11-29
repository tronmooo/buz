import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export class AIService {
  async generateBusinessSummary(businessData: {
    businessName: string;
    transactions: any[];
    invoices: any[];
    contacts: number;
    customers: number;
    accounts: any[];
  }): Promise<string> {
    try {
      const prompt = `You are a business analyst AI assistant. Analyze the following business data and provide a comprehensive summary with insights and recommendations.

Business: ${businessData.businessName}

Financial Overview:
- Total Accounts: ${businessData.accounts.length}
- Total Balance: $${businessData.accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0).toFixed(2)}
- Recent Transactions: ${businessData.transactions.length}
- Invoices: ${businessData.invoices.length}

Customer Base:
- Contacts: ${businessData.contacts}
- Customers: ${businessData.customers}

Recent Transactions (Last 10):
${businessData.transactions.slice(0, 10).map((t, i) => `${i + 1}. ${t.type}: $${t.amount} - ${t.description || 'No description'} (${new Date(t.date).toLocaleDateString()})`).join('\n')}

Recent Invoices:
${businessData.invoices.slice(0, 5).map((inv, i) => `${i + 1}. Invoice #${inv.number}: $${inv.total} - Status: ${inv.status}`).join('\n')}

Please provide:
1. A brief overview of the business health
2. Key financial insights
3. 3-5 actionable recommendations
4. Any risks or concerns to address
5. Opportunities for growth

Keep the response concise and actionable (under 500 words).`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      return textContent?.type === 'text' ? textContent.text : 'Unable to generate summary';
    } catch (error) {
      logger.error('AI Service Error:', error);
      throw new Error('Failed to generate business summary');
    }
  }

  async answerBusinessQuestion(
    question: string,
    context: {
      businessName: string;
      recentData: any;
    }
  ): Promise<string> {
    try {
      const prompt = `You are an AI business assistant for ${context.businessName}.

Context about the business:
${JSON.stringify(context.recentData, null, 2)}

User Question: ${question}

Provide a helpful, specific answer based on the available data. If you don't have enough information, say so and suggest what data would be helpful.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      return textContent?.type === 'text' ? textContent.text : 'Unable to answer question';
    } catch (error) {
      logger.error('AI Service Error:', error);
      throw new Error('Failed to answer question');
    }
  }

  async generateInvoiceEmail(invoice: {
    number: string;
    customerName: string;
    total: number;
    dueDate: string;
    items: any[];
  }): Promise<string> {
    try {
      const prompt = `Generate a professional email to send with an invoice.

Invoice Details:
- Invoice Number: ${invoice.number}
- Customer: ${invoice.customerName}
- Total Amount: $${invoice.total}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
- Items: ${invoice.items.length} items

Write a polite, professional email that:
1. Thanks the customer
2. Summarizes the invoice
3. Provides payment instructions
4. Offers to answer any questions

Keep it concise and friendly.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      return textContent?.type === 'text' ? textContent.text : 'Unable to generate email';
    } catch (error) {
      logger.error('AI Service Error:', error);
      throw new Error('Failed to generate invoice email');
    }
  }

  async suggestCategories(
    description: string,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<string[]> {
    try {
      const prompt = `Given this transaction description: "${description}"
Transaction type: ${type}

Suggest 3-5 relevant category names that would be good for categorizing this transaction. Return only the category names, one per line, no explanations.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 128,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      if (textContent?.type === 'text') {
        return textContent.text.split('\n').filter((line) => line.trim());
      }
      return [];
    } catch (error) {
      logger.error('AI Service Error:', error);
      return [];
    }
  }
}

export const aiService = new AIService();
