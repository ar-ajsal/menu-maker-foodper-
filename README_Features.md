# New Features Implemented

## 1. Subscription System (Razorpay Test Mode)
- **Automatic Trial**: New users get a 14-day free trial.
- **Subscription Check**: The system checks if the trial has expired.
- **Payment Integration**: 
  - Uses Razorpay Test Keys.
  - Users with expired subscriptions will see a banner in the dashboard.
  - Public menu pages will show a "Subscription Expired" banner if the owner's plan is invalid.
- **Testing**:
  - Log in to the dashboard.
  - If you see the upgrade banner, click "Upgrade Now".
  - Use Razorpay Test Card credentials (e.g., any valid card format for test mode) to complete payment.

## 2. Image Menu Mode
- **Toggle**: In the Dashboard -> Settings tab, you can now switch between "Digital Menu" and "Image Menu".
- **Upload**: When "Image Menu" is selected, you can upload a local image file.
- **Public View**: The public menu page (`/menu/:slug`) will automatically switch to showing the full-width image if enabled.

## 3. Cloudinary Integration
- **Storage**: Menu images are uploaded to Cloudinary.
- **Configuration**: Keys are set in `.env`.

## How to Run
The server automatically finds a free port (defaulting to 5000, then 5001, etc.).
Check the terminal output to see which port is active.

```bash
npm run dev
```
