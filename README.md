# Payments - Settings & Integration Guide

الملف ده بيشرح إعداد وتشغيل نظام الدفع (Payments) + ربط الـ Frontend + Webhooks لكل بوابة.

## 1) المفاهيم الأساسية

- **Tenant-aware**: مفاتيح الدفع (API/Secret/WebhookSecret) بتتخزن per-tenant في جدول `TenantPaymentGatewayConfig`.
- **Initiate**: الـ Frontend يبدأ الدفع عن طريق `invoiceId`، والـ Backend ينشئ `Payment` (Pending) ويرجع `RedirectUrl`.
- **Webhook**: بوابات الدفع بتخبط Webhook endpoint علشان نعمل `PaymentSucceededEvent` / `PaymentFailedEvent` داخل الـ Outbox.

---

## 2) Auth + tenant_id

### 2.1 Login

- `POST /api/account/login`
- لازم تستخدم:

```
Authorization: Bearer <ACCESS_TOKEN>
```

### 2.2 tenant_id

- Endpoint `POST /api/payments/initiate` بيقرأ `tenant_id` من الـ JWT claim.
- لو `tenant_id` مش موجود/مش valid هيرجع 401.

---

## 3) Configure Payment Gateway Keys (Per Tenant)

### 3.1 Admin Endpoints

**Controller**: `TenantPaymentGatewayConfigsController`

- Base route:
  - `api/admin/tenants/{tenantId:guid}/payment-gateway-configs`

Endpoints:
- `GET /api/admin/tenants/{tenantId}/payment-gateway-configs`
- `GET /api/admin/tenants/{tenantId}/payment-gateway-configs/{gateway}`
- `PUT /api/admin/tenants/{tenantId}/payment-gateway-configs`

> Required policy: `AuthorizationConstants.AcademySuperAdminPolicy`

### 3.2 Upsert Body

`TenantPaymentGatewayConfigUpsertDto`:

```json
{
  "gateway": "Stripe",
  "apiKey": "...optional depending on gateway...",
  "secretKey": "...",
  "webhookSecret": "...",
  "isActive": true
}
```

### 3.3 Gateway string values

من الـ code الحالي، المتوفر كـ tenant webhook handlers:
- `Stripe` (gateway implementation موجودة كـ `IPaymentGateway`)
- `Tap`
- `Paymob`
- `Fawry`

> مهم: لازم نفس الاسم اللي الـ code متوقعه. في handlers:
- `TapTenantWebhookHandler` -> `Gateway => "Tap"`
- `PaymobTenantWebhookHandler` -> `Gateway => "Paymob"`
- `FawryTenantWebhookHandler` -> `Gateway => "Fawry"`

---

## 4) Initiate Payment (Frontend)

**Controller**: `PaymentsController`

### 4.1 Initiate

- `POST /api/payments/initiate`
- Auth: Required
- Permission: `PaymentsCreate`

Body: `InitiatePaymentDto` (مختصر)

```json
{
  "invoiceId": "GUID",
  "method": "Card"
}
```

Response: `InitiatePaymentResultDto` (مختصر)
- `paymentId`
- `invoiceId`
- `amount`
- `gateway`
- `gatewayReference`
- `redirectUrl`
- `referenceNumber`

### 4.2 Redirect

الـ Frontend يعمل redirect مباشرة إلى `redirectUrl` (Stripe Checkout URL).

> في `PaymentService.InitiateCheckoutAsync` الـ gateway الحالية **مقفولة على Stripe** (بتدور على `IPaymentGateway` اسمه "Stripe").

---

## 5) Stripe Settings

### 5.1 Stripe Checkout URLs

StripePaymentGateway بيستخدم `StripeOptions` اللي جاية من config:
- `Stripe:SuccessUrl` فيها token `{PAYMENT_ID}`
- `Stripe:CancelUrl` فيها token `{PAYMENT_ID}`

مثال في `appsettings.json`:
- `Stripe:SuccessUrl = https://YOUR-FRONTEND/success?paymentId={PAYMENT_ID}`
- `Stripe:CancelUrl  = https://YOUR-FRONTEND/cancel?paymentId={PAYMENT_ID}`

### 5.2 Stripe Secret Key (per-tenant)

- StripePaymentGateway بياخد `SecretKey` من `TenantPaymentGatewayConfig` للـ tenant.
- الـ `Stripe:SecretKey` في `appsettings.json` مش اللي بيتستخدم فعليًا في تنفيذ checkout (الـ code بيستخدم per-tenant secret).

---

## 6) Webhooks (Production Required)

عندك مسارين للـ webhooks:

### 6.1 Tenant-Aware Webhooks (Recommended)

**Controller**: `TenantPaymentWebhookController`

- `POST /api/webhooks/payments/{gateway}/{tenantId:guid}`
- `AllowAnonymous`

هنا الـ code بيعمل:
- Load tenant active config for gateway
- Verify signature (حسب gateway)
- Resolve `paymentId` من payload
- Write outbox event (`PaymentSucceededEvent` أو `PaymentFailedEvent`)

#### Tap
- signature: header `hashstring`
- secret: `cfg.SecretKey` أو fallback `cfg.ApiKey`

#### Paymob
- signature: query param `hmac` (مقروء كـ `query:hmac`)
- secret: `cfg.WebhookSecret` أو `cfg.SecretKey` أو `cfg.ApiKey`

#### Fawry
- signature: field `messageSignature` داخل body
- secureKey: `cfg.WebhookSecret` أو `cfg.SecretKey` أو `cfg.ApiKey`

### 6.2 Stripe Dedicated Webhook

**Controller**: `StripeWebhookController`

- `POST /api/webhooks/stripe/{tenantId:guid}`
- Header required:
  - `Stripe-Signature`

StripeWebhookService:
- بيستخدم per-tenant `WebhookSecret`
- Idempotency: بيمنع تكرار نفس event id عن طريق `_webhookEventRepo`
- بيركّز على:
  - `checkout.session.completed` -> outbox `PaymentSucceededEvent`
  - `checkout.session.async_payment_failed` / `payment_intent.payment_failed` -> outbox `PaymentFailedEvent`

---

## 7) Testing Checklist

### 7.1 Setup

1) اعمل Tenant
2) من admin account، upsert config للـ gateway:
   - Stripe: `SecretKey` + `WebhookSecret` + `IsActive=true`
3) اعمل invoice للـ tenant

### 7.2 Initiate from Frontend / Postman

- Call `POST /api/payments/initiate`
- خد `redirectUrl`
- افتحها في المتصفح واعمل test payment (Stripe test card)

### 7.3 Webhook Local Testing

لو هتجرب Webhooks محلي:
- استخدم Stripe CLI أو ngrok
- سجل webhook URL على Stripe dashboard:
  - `https://<public-url>/api/webhooks/stripe/{tenantId}`

### 7.4 Verify Results

- راقب جدول `Payments`:
  - status يتحول Paid/Failed بعد معالجة outbox/event
- راقب outbox/events لو عندك background publisher

---

## 8) Security Notes

- **ممنوع** وضع أي `secretKey/webhookSecret` في الـ Frontend.
- انقل القيم الحساسة إلى environment variables في production.
- webhooks لازم تكون `AllowAnonymous` (TenantPaymentWebhookController عامل كده). Controller تاني اسمه `PaymentWebhookController` عليه `[Authorize]` ومش مناسب للـ providers.
