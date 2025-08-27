---
description: Create fullstack deposit system with NextJS frontend and backend API integration
auto_execution_mode: 1
---

- Read collection postman in directory /docs/*.json and make it as base documentation that need to create
- all of the endpoint shoud be implemented
- some API need require client to sign the request, see directory /signature-example to sign the request
- create interface to implement all the feature, included: transfer out, check status, show balance and list journal balance
- create backend for interact with APIs


## Project Overview
Build a complete fullstack B2C disbursement system using NextJS and Axios that integrates with the B2C Disburse API. The system should handle secure API communication with RSA signature authentication.

## Phase 1: Project Setup & Structure
1. Initialize NextJS project with TypeScript
2. Install required dependencies: axios, crypto (built-in), tailwindcss, lucide-react
3. Create project structure:
   ```
   /components - UI components
   /pages/api - Backend API routes
   /lib - Utilities (signature generation, API client)
   /types - TypeScript interfaces
   /utils - Helper functions
   ```
4. Set up environment configuration for dev/prod/custom environments
5. Create .env.example with required environment variables

## Phase 2: API Integration Layer
1. **Create signature utilities** (based on /signature-example):
   - `lib/signature.ts` - RSA signature generation functions
   - Support for access token, transfer inquiry, and transfer out signatures
   - Handle DER to PEM conversion and timestamp validation

2. **Create API client** (`lib/api-client.ts`):
   - Axios instance with base configuration
   - Automatic signature generation for secured endpoints
   - Request/response interceptors for error handling
   - Support for different environments (dev/prod/custom)

3. **Implement API endpoints** (based on Postman collection):
   - `GET /info/channels` - List available channels
   - `GET /info/banks` - List supported banks
   - `GET /auth/access-token` - Get authentication token (with signature)
   - `POST /transaction/transfer-inquiry` - Validate transfer details (with signature)
   - `POST /transaction/transfer-out` - Execute transfer (with signature)
   - `GET /transaction/status/:id` - Check transaction status
   - `GET /wallet/balance` - Get wallet balance
   - `GET /wallet/journal` - Get transaction history with pagination

## Phase 3: Backend API Routes
Create NextJS API routes in `/pages/api/`:
1. `auth/token.ts` - Proxy for access token with signature
2. `info/channels.ts` - Get channels list
3. `info/banks.ts` - Get banks list
4. `transaction/inquiry.ts` - Transfer inquiry with signature
5. `transaction/transfer.ts` - Execute transfer with signature
6. `transaction/status.ts` - Check transaction status
7. `wallet/balance.ts` - Get balance
8. `wallet/journal.ts` - Get transaction history

## Phase 4: Frontend Components
1. **Layout & Navigation**:
   - Main layout with sidebar navigation
   - Responsive design with Tailwind CSS
   - Environment switcher (dev/prod/custom)

2. **Dashboard Page**:
   - Balance display card
   - Recent transactions summary
   - Quick action buttons

3. **Transfer Out Page**:
   - Bank selection dropdown (from /info/banks)
   - Channel selection (from /info/channels)
   - Account number input with validation
   - Amount input with formatting
   - Transfer inquiry before execution
   - Confirmation modal with transfer details

4. **Transaction Status Page**:
   - Transaction ID search
   - Status display with color coding
   - Transaction details view

5. **Balance & Journal Page**:
   - Current balance display
   - Transaction history table with pagination
   - Filters: date range, entry type (debit/credit)
   - Export functionality

## Phase 5: Security & Error Handling
1. **Signature Implementation**:
   - Secure private key handling (environment variables)
   - Proper timestamp generation (ISO 8601 format)
   - Signature validation on both client and server side

2. **Error Handling**:
   - API error responses with user-friendly messages
   - Network error handling with retry logic
   - Form validation with real-time feedback
   - Loading states for all async operations

3. **Security Best Practices**:
   - Never expose private keys in client-side code
   - Validate all inputs on both client and server
   - Implement rate limiting for API calls
   - Secure environment variable handling

## Phase 6: Environment Configuration
1. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://disb2c-dev.xpay378.uk/api
   PARTNER_ID=A00
   PRIVATE_KEY=<RSA_PRIVATE_KEY>
   MERCHANT_ID=<MERCHANT_ID>
   ```

2. **Environment Switching**:
   - Support for dev, production, and custom environments
   - Runtime environment configuration
   - API endpoint switching based on environment

## Phase 7: Testing & Documentation
1. **Testing**:
   - Test signature generation against provided examples
   - Test all API endpoints with real data
   - Validate error handling scenarios

2. **Documentation**:
   - README with setup instructions
   - API documentation
   - Environment configuration guide
   - Deployment instructions

## Technical Requirements
- **Frontend**: NextJS 13+ with App Router, TypeScript, Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **Styling**: Modern, responsive UI with loading states
- **Security**: RSA-SHA256 signature authentication
- **Error Handling**: Comprehensive error handling with user feedback
- **Environment**: Flexible environment configuration (dev/prod/custom)

## Key Features to Implement
1. **Transfer Out**: Complete flow from inquiry to execution
2. **Balance Check**: Real-time balance display
3. **Transaction Status**: Search and view transaction details
4. **Transaction History**: Paginated journal with filters
5. **Bank/Channel Management**: Dynamic lists from API
6. **Signature Authentication**: Secure API communication

## Success Criteria
- All API endpoints from Postman collection are implemented
- Signature generation matches the examples in /signature-example
- UI is user-friendly and responsive
- Error handling provides clear feedback
- System works across different environments
- Code is well-structured and maintainable