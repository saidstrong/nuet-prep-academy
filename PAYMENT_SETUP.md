# Payment & Enrollment System Setup Guide

## 🚀 Overview

This guide explains how to set up the dual payment system for NUET Prep Academy:
1. **Manual Enrollment System** (WhatsApp/Telegram + Kaspi Bank) - ✅ Ready to use
2. **Stripe Payment Integration** (Online card payments) - Requires setup

## 💳 Manual Enrollment System (Ready to Use)

The manual enrollment system is fully implemented and ready to use:

### How it works:
1. Students select a course and choose "Contact Us for Payment"
2. They fill out a contact form with their details
3. You receive the request in the Admin Dashboard
4. Process payment via Kaspi Bank
5. Mark as paid and approve enrollment
6. Student gets instant access to the course

### Features:
- ✅ Contact form collection
- ✅ Admin management interface
- ✅ Status tracking (Pending → Paid → Approved)
- ✅ Automatic student enrollment after approval
- ✅ Payment record creation

## 🔐 Stripe Payment Integration (Requires Setup)

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account (you'll need a parent/guardian if under 18)
3. Complete business verification
4. Get your API keys from the dashboard

### Step 2: Environment Variables
Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Step 3: Webhook Setup
1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret to your environment variables

### Step 4: Test the Integration
1. Use Stripe test cards for testing
2. Test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

## 🎯 How Students Use the System

### Option 1: Manual Enrollment (Recommended for now)
1. Browse courses at `/courses`
2. Click "Enroll" on desired course
3. Choose "Contact Us for Payment"
4. Fill contact form
5. Wait for your response via WhatsApp/Telegram
6. Pay via Kaspi Bank
7. Get enrolled automatically

### Option 2: Online Payment (After Stripe setup)
1. Browse courses at `/courses`
2. Click "Enroll" on desired course
3. Choose "Pay Online with Card"
4. Complete Stripe checkout
5. Get instant enrollment

## 🔧 Admin Management

### Access Enrollment Requests:
1. Go to Admin Dashboard
2. Click "Enrollment Requests" tab
3. View all pending requests
4. Process payments and approve enrollments

### Workflow:
1. **Pending**: New request received
2. **Paid**: Mark when Kaspi payment confirmed
3. **Approved**: Enroll student in course
4. **Rejected**: If request cannot be fulfilled

## 💡 Benefits of This System

### For You (Under 18):
- ✅ **Manual system works immediately** - no age restrictions
- ✅ **Professional appearance** - students see both options
- ✅ **Scalable** - can add Stripe later when ready
- ✅ **Local payment support** - Kaspi Bank integration

### For Students:
- ✅ **Multiple payment options** - flexibility
- ✅ **Professional interface** - builds trust
- ✅ **Instant enrollment** - after payment confirmation
- ✅ **Clear communication** - WhatsApp/Telegram support

## 🚨 Important Notes

### Manual System:
- Monitor Admin Dashboard regularly
- Respond to requests within 24 hours
- Keep track of Kaspi payments
- Update request statuses promptly

### Stripe System:
- Test thoroughly before going live
- Monitor webhook delivery
- Keep API keys secure
- Handle failed payments gracefully

## 🔄 Next Steps

1. **Immediate**: Start using the manual enrollment system
2. **Short-term**: Set up Stripe for online payments
3. **Long-term**: Add more payment gateways (PayPal, etc.)

## 📞 Support

If you need help setting up Stripe or have questions:
- Check Stripe documentation
- Test with small amounts first
- Monitor the Admin Dashboard for issues

---

**The manual enrollment system is ready to use immediately!** 🎉
Start accepting students while you set up Stripe for online payments.
