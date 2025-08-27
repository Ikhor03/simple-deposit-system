# B2C Deposit System

A simple fullstack deposit system built with NextJS and Axios for B2C disbursement transactions.

## Features

- **Single Page Application**: All features accessible from one page
- **Transfer Out**: Complete transfer flow with inquiry and execution
- **Balance Check**: Real-time wallet balance display
- **Transaction Status**: Search and view transaction details
- **Transaction History**: Paginated journal with filters
- **Environment Support**: Dev, production, and custom environments
- **RSA Signature Authentication**: Secure API communication

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment** (optional):
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Configuration

The system supports three environments:

- **Development**: Pre-configured with test credentials
- **Production**: Requires your production credentials
- **Custom**: Fully customizable environment

You can switch environments using the dropdown in the header.

## API Endpoints

All API endpoints are implemented as NextJS API routes:

- `POST /api/auth/token` - Get access token
- `POST /api/info/channels` - List channels
- `POST /api/info/banks` - List banks
- `POST /api/transaction/inquiry` - Transfer inquiry
- `POST /api/transaction/transfer` - Execute transfer
- `POST /api/transaction/status` - Check status
- `POST /api/wallet/balance` - Get balance
- `POST /api/wallet/journal` - Get transaction history

## Usage

1. **Load Data**: Click "Load Data" to fetch initial information
2. **Transfer Out**: 
   - Select bank and channel
   - Enter account number and amount
   - Check transfer details
   - Confirm transfer
3. **Check Status**: Enter transaction ID to view status
4. **View History**: Browse transaction journal with pagination

## Tech Stack

- **Frontend**: NextJS 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Security**: RSA-SHA256 signatures

## Project Structure

```
src/
├── app/                 # NextJS app directory
├── pages/api/          # API routes
├── lib/                # Utilities (signature, API client)
├── types/              # TypeScript interfaces
└── components/         # React components (future use)
```

## Security

- Private keys are handled securely on the server side
- All API requests use RSA-SHA256 signature authentication
- Environment variables protect sensitive credentials
- Client-side code never exposes private keys

## Development

The system is designed to be simple and flexible:

- Single page interface for all features
- Environment switching without restart
- Real-time error handling and feedback
- Responsive design for all screen sizes

## License

ISC
