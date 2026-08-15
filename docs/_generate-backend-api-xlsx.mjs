import ExcelJS from 'exceljs';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'GUNUCO-Customer-App-Backend-API-Contract.xlsx');

/** @typedef {[string, string, string, string, string, string, string, string, string]} Row */

/** @type {Row[]} */
const rows = [
  [
    'Authentication',
    'POST',
    '/auth/otp/request',
    'Anonymous — do not send Bearer',
    'Phone login screen. Guest tap on cart/wishlist/checkout also lands here.',
    '{ "phone": "string (Indian mobile, E.164 or 10-digit as sent by app)" }',
    '{ "challengeId": "string", "expiresIn": "number (seconds)" }',
    'Implemented',
    'challengeId must stay in the response body only. Do not put it in a URL.',
  ],
  [
    'Authentication',
    'POST',
    '/auth/otp/verify',
    'Anonymous — do not send Bearer',
    'OTP screen. Creates session. App stores accessToken + refreshToken in SecureStore.',
    '{ "phone": "string", "challengeId": "string", "otp": "string" }',
    '{ "accessToken": "string", "refreshToken": "string", "customer": { "customerId": "string", "phone": "string", "name?": "string", "email?": "string", "profileImage?": "string" }, "isNewUser": "boolean" }',
    'Implemented',
    'Phone + OTP only. No password. Same endpoint for login and register.',
  ],
  [
    'Authentication',
    'POST',
    '/auth/token/refresh',
    'Body refreshToken only (not Bearer of expired access token)',
    'Cold start session restore and 401 interceptor. One in-flight refresh (mutex).',
    '{ "refreshToken": "string" }',
    '{ "accessToken": "string", "refreshToken": "string" }',
    'Implemented',
    'On failure the app signs the customer out and clears RTK cache.',
  ],
  [
    'Authentication',
    'POST',
    '/auth/logout',
    'Bearer required',
    'Profile and Settings logout. App always clears local session even if this fails.',
    '{ "refreshToken": "string (optional)" }',
    '{ "ok": true }',
    'Implemented',
    '',
  ],
  [
    'Profile',
    'GET',
    '/customers/me',
    'Bearer required',
    'Session restore after refresh; Profile tab; Edit Profile.',
    'None',
    '{ "customerId": "string", "phone": "string", "name?": "string", "email?": "string", "profileImage?": "string", "status?": "string" } Envelope { customer } / { data } / bare object is accepted.',
    'Implemented',
    'Profile image upload is NOT implemented. Display URL only if returned.',
  ],
  [
    'Profile',
    'PATCH',
    '/customers/me',
    'Bearer required',
    'Edit Profile save. Draft is kept on failure.',
    '{ "name?": "string", "email?": "string|null" }',
    'Updated customer object (same shape as GET /customers/me).',
    'Implemented',
    'Do not require profileImage. Image multipart is [CONFIRM] and not called.',
  ],
  [
    'Profile — Change phone',
    'POST',
    '/auth/phone/change/request',
    'Bearer required',
    'Change Phone screen. challengeId kept in memory only.',
    '{ "newPhone": "string" }',
    '{ "challengeId": "string", "expiresIn": "number", "otpLength?": "number" }',
    'Implemented',
    '[CONFIRM] extra request fields. OTP length defaults to 6 if omitted.',
  ],
  [
    'Profile — Change phone',
    'POST',
    '/auth/phone/change/verify',
    'Bearer required',
    'Change Phone OTP screen.',
    '{ "challengeId": "string", "otp": "string" }',
    'Updated customer object.',
    'Implemented',
    '[CONFIRM] extra verify fields.',
  ],
  [
    'App lifecycle',
    'GET',
    '/app/config',
    'Public',
    'Bootstrap (after theme restore) and AppState foreground recheck. Failure is FAIL-OPEN (do not assume maintenance).',
    'None',
    '{ "minVersion?": "string", "latestVersion?": "string", "forceUpdate": "boolean", "maintenanceMode": "boolean", "maintenanceMessage?": "string", "storeUrls?": { "android?": "https|market URL", "ios?": "https|itms-apps URL" } } Also accepts minSupportedVersion, maintenance, stores.playStore/appStore.',
    'Implemented',
    '[CONFIRM] storeUrls shape. Numeric semver compare on client. Maintenance takes priority over force update.',
  ],
  [
    'Home',
    'GET',
    '/customer/home',
    'Public (Bearer attached only if logged in)',
    'Home tab. Guest browse allowed.',
    'None',
    '{ "deliveryContext?": { "label": "string", "addressId?": "string", "isServiceable?": "boolean" }, "banners?": [{ "id": "string", "imageUrl": "string", "title?": "string", "linkType?": "product|category|offer|url", "linkId?": "string" }], "mainCategories?": [{ "id": "string", "name": "string", "imageUrl?": "string" }], "subcategories?": "same", "featuredProducts?": "ProductSummary[]", "bestSellers?": "ProductSummary[]", "offers?": [{ "id": "string", "title": "string", "subtitle?": "string", "imageUrl?": "string", "badgeLabel?": "string" }], "recommendedProducts?": "ProductSummary[]", "unreadNotificationCount?": "number" }',
    'Implemented',
    'Do not invent Home sections. Inactive mains (Coffee/Pizza/Burgers) omitted until activated. ProductSummary: id, name, imageUrl, pricePaise (integer), compareAtPricePaise?, ratingAverage?, ratingCount?, isWishlisted?, isAvailable?, hasRequiredOptions?.',
  ],
  [
    'Catalogue',
    'GET',
    '/categories',
    'Public',
    'Categories tab, category browse, Home category navigation.',
    'None',
    '{ "categories": [{ "id": "string", "name": "string", "imageUrl?": "string", "parentId?": "string", "isActive?": "boolean", "children?": "CategoryNode[]", "productCount?": "number" }] } Also accepts a bare array or { data: [] }.',
    'Implemented',
    'Customer-visible active tree only. Wedding/Birthday cakes and cookies are normal categories, not custom-cake APIs.',
  ],
  [
    'Catalogue',
    'GET',
    '/categories/{id}/products',
    'Public',
    'Category product listing. Pagination, sort, filters.',
    'Query: page, sort=popular|price_asc|price_desc|newest, priceMin, priceMax (paise), plus backend filter group ids as query keys.',
    '{ "items": "ProductSummary[]", "page": "number", "pageSize": "number", "total": "number", "hasMore": "boolean", "category?": "CategorySummary", "availableFilters?": [{ "id": "string", "label": "string", "type": "single|multi|range", "options?": [{ "id": "string", "label": "string", "value": "string" }], "minPaise?": "number", "maxPaise?": "number" }], "availableSorts?": [{ "id": "string", "label": "string" }] }',
    'Implemented',
    '[CONFIRM] pagination page vs cursor. App uses page-based merge.',
  ],
  [
    'Search',
    'GET',
    '/products/search',
    'Public',
    'Search tab. Debounced 350ms, minimum 2 characters.',
    'Query: q (required), page, sort, priceMin, priceMax, subcategory, plus option filter keys from availableFilters.',
    'Same list envelope as GET /categories/{id}/products.',
    'Implemented',
    'No recent-search API.',
  ],
  [
    'Product Details',
    'GET',
    '/products/{id}',
    'Public',
    'Product Details screen. Deep link /product/{id}.',
    'Path: product id only.',
    'ProductDetail: ProductSummary plus description, images[{url,alt}], offer/offers, availabilityStatus/Label, quantityMin/Max, infoSections[{title,body}], optionGroups?, category?, isWishlisted?. Envelope { product } / { data } / bare object.',
    'Implemented',
    '404 → empty/not found UI. Unavailable product stays visible with CTA disabled.',
  ],
  [
    'Product Details',
    'GET',
    '/products/{id}/options',
    'Public',
    'Product Details option renderer. 404 treated as no options.',
    'Path: product id only.',
    '{ "groups": [{ "id": "string", "label": "string", "required?": "boolean", "type?": "string", "minSelect?": "number", "maxSelect?": "number", "defaultValueId?": "string", "options": [{ "id": "string", "label": "string", "available?": "boolean", "unavailableLabel?": "string", "pricePaise?": "number", "compareAtPricePaise?": "number", "isDefault?": "boolean" }] }], "variants?": [{ "id": "string", "optionValueIds": "string[]", "pricePaise": "number", "isAvailable?": "boolean" }] }',
    'Implemented',
    'Schema-driven. Do not send cake-specific fields. Display labels, never raw option IDs to customers. POST /products/quote is NOT called.',
  ],
  [
    'Wishlist',
    'GET',
    '/wishlist',
    'Bearer required',
    'Wishlist screen and shared WishlistButton heart state. Skipped for guests.',
    'None',
    '{ "items": "ProductSummary[]" } (or { data } / { wishlist }).',
    'Implemented',
    'No local guest wishlist. Customer-specific. Must clear after logout.',
  ],
  [
    'Wishlist',
    'POST',
    '/wishlist/{productId}',
    'Bearer required',
    'Heart add on ProductCard, Product Details, Wishlist.',
    'Path productId. Empty body.',
    '2xx. App invalidates wishlist + product tags.',
    'Implemented',
    'Non-optimistic. Failure keeps previous heart state.',
  ],
  [
    'Wishlist',
    'DELETE',
    '/wishlist/{productId}',
    'Bearer required',
    'Heart remove.',
    'Path productId. Empty body.',
    '2xx.',
    'Implemented',
    '',
  ],
  [
    'Reviews',
    'GET',
    '/products/{id}/reviews',
    'Public',
    'Product Reviews list. Pagination.',
    'Query: page?',
    '{ "items": [{ "id": "string", "rating": "number", "text?": "string", "createdAt?": "string", "reviewerDisplayName?": "string" }], "page": "number", "pageSize": "number", "total": "number", "hasMore": "boolean", "ratingAverage?": "number", "ratingCount?": "number" }',
    'Implemented',
    'Approved reviews only. Client does not recalculate averages.',
  ],
  [
    'Reviews',
    'GET',
    '/orders/{id}/reviewable-items',
    'Bearer required',
    'Order Detail Write Review eligibility.',
    'Path orderId.',
    '{ "items": [{ "orderItemId": "string", "productId?": "string", "productName?": "string" }] }',
    'Implemented',
    'Backend owns eligibility. No fake orders.',
  ],
  [
    'Reviews',
    'POST',
    '/reviews',
    'Bearer required',
    'Write Review screen. Requires real orderItemId from query/eligibility.',
    '{ "orderItemId": "string", "rating": "number", "text": "string" }',
    '{ "id?": "string", "status?": "pending|submitted|approved" } If pending/submitted, UI shows moderation copy and does not treat as public.',
    'Implemented',
    'Do not accept arbitrary productId-only reviews. productId is not sent.',
  ],
  [
    'Cart',
    'GET',
    '/cart',
    'Bearer required',
    'Cart tab, cart badge, Checkout, after payment confirm.',
    'None',
    'Cart: { id?, items: [{ id, productId, name, imageUrl?, quantity, quantityMin?, quantityMax?, unitPricePaise, lineTotalPaise?, optionsSummary?, selectedOptions?[{ groupLabel, valueLabels }], isAvailable?, priceChanged?, optionsChanged? }], totals: { subtotalPaise?, discountPaise?, storeCreditPaise?, taxPaise?, deliveryFeePaise?, totalPaise? }, coupon? { code, label }, storeCreditApplied?, itemCount?, totalQuantity?, isValid?, canCheckout?, checkoutBlocked?, checkoutBlockedReason?, changes?[{ type, message, productName }], message? }. Envelope { cart } / { data } / bare.',
    'Implemented',
    'ALL money integer paise. Backend calculates totals. No guest cart.',
  ],
  [
    'Cart',
    'POST',
    '/cart/items',
    'Bearer required',
    'Product Details Add to Cart. Wishlist add-to-cart when options are already known to be safe.',
    '{ "productId": "string", "quantity": "number", "options": [{ "groupId": "string", "valueIds": "string[]" }] }',
    '{ "itemId?": "string", "cartId?": "string" } (or full cart). App then invalidates GET /cart.',
    'Implemented',
    'Guests are sent to phone auth. Success UI only after 2xx. Option-required products must go through Product Details.',
  ],
  [
    'Cart',
    'PATCH',
    '/cart/items/{id}',
    'Bearer required',
    'Cart quantity stepper. Previous quantity kept until 2xx.',
    '{ "quantity": "number" }',
    'Updated cart (preferred) or 2xx then GET /cart.',
    'Implemented',
    'No optimistic totals. Duplicate in-flight qty updates blocked on UI.',
  ],
  [
    'Cart',
    'DELETE',
    '/cart/items/{id}',
    'Bearer required',
    'Cart remove (after confirm dialog). Item stays until 2xx.',
    'Path cart line id. Empty body.',
    'Updated cart or 2xx then GET /cart.',
    'Implemented',
    '',
  ],
  [
    'Cart',
    'POST',
    '/cart/revalidate',
    'Bearer required',
    'Checkout immediately before POST /checkout. Not called from Cart tab.',
    'Empty body (session cart).',
    'Updated cart including changes[] / invalid flags. If changes exist, Checkout stays and shows CartChangeBanner.',
    'Implemented',
    'Backend revalidates price, availability, options, offers.',
  ],
  [
    'Cart — Coupon',
    'POST',
    '/cart/apply-coupon',
    'Bearer required',
    'Cart and Checkout CouponInput.',
    '{ "code": "string" }',
    'Updated cart with coupon + totals.',
    'Implemented',
    'Backend owns stacking. Error codes: COUPON_INVALID, EXPIRED, MIN_ORDER, NOT_ELIGIBLE, ALREADY_APPLIED, STACKING.',
  ],
  [
    'Cart — Coupon',
    'DELETE',
    '/cart/coupon',
    'Bearer required',
    'Remove applied coupon.',
    'Empty body.',
    'Updated cart.',
    'Implemented',
    '',
  ],
  [
    'Cart — Store credit',
    'POST',
    '/cart/apply-store-credit',
    'Bearer required',
    'Checkout “use available store credit”. No amount picker.',
    '{ "max": true }',
    'Updated cart with storeCreditApplied and totals.storeCreditPaise.',
    'Implemented',
    '[CONFIRM] amount vs max. App currently sends { max: true } only.',
  ],
  [
    'Cart — Store credit',
    'DELETE',
    '/cart/store-credit',
    'Bearer required',
    'Checkout remove store credit.',
    'Empty body.',
    'Updated cart.',
    'Implemented',
    '',
  ],
  [
    'Addresses',
    'GET',
    '/addresses',
    'Bearer required',
    'Address book and Checkout address picker.',
    'None',
    '{ "items": [{ "id": "string", "addressType": "Home|Office|Other", "name": "string", "phone?": "string", "house": "string", "street": "string", "area": "string", "landmark?": "string", "city": "string", "state": "string", "pincode": "string", "lat": "number", "lng": "number", "isDefault?": "boolean" }] } Envelope { addresses } / { items } / { data }.',
    'Implemented',
    '',
  ],
  [
    'Addresses',
    'POST',
    '/addresses',
    'Bearer required',
    'Address form create (map pin required).',
    '{ "addressType": "Home|Office|Other", "name": "string", "phone": "string", "house": "string", "street": "string", "area": "string", "landmark?": "string", "city": "string", "state": "string", "pincode": "string", "lat": "number", "lng": "number", "isDefault?": "boolean" }',
    'Created Address object.',
    'Implemented',
    'lat/lng from customer map tap, not background GPS.',
  ],
  [
    'Addresses',
    'PATCH',
    '/addresses/{id}',
    'Bearer required',
    'Address form edit.',
    'Same body as POST (partial fields as sent).',
    'Updated Address object.',
    'Implemented',
    '',
  ],
  [
    'Addresses',
    'DELETE',
    '/addresses/{id}',
    'Bearer required',
    'Address book delete (confirm).',
    'Path id. Empty body.',
    '2xx.',
    'Implemented',
    '',
  ],
  [
    'Fulfilment',
    'POST',
    '/fulfilment/serviceability',
    'Bearer required',
    'Checkout delivery. Fee displayed from this response, not calculated on client.',
    '{ "lat": "number", "lng": "number" }',
    '{ "serviceable": "boolean", "feePaise?": "number", "message?": "string" } Also accepts fee as paise.',
    'Implemented',
    'Backend owns delivery fee. No frontend fee math.',
  ],
  [
    'Fulfilment',
    'GET',
    '/fulfilment/slots',
    'Bearer required',
    'Checkout ASAP / schedule. Slots never hard-coded.',
    'Query: date (YYYY-MM-DD), fulfilmentType=DELIVERY|PICKUP',
    '{ "date": "string", "fulfilmentType": "DELIVERY|PICKUP", "asapAvailable": "boolean", "slots": [{ "id": "string", "label": "string", "startAt?": "string", "endAt?": "string", "available?": "boolean" }], "availableDates?": "string[]", "cutoffMessage?": "string", "message?": "string" }',
    'Implemented',
    '[CONFIRM] whether cart/location is implied by session or extra query params. App does not send undocumented extras.',
  ],
  [
    'Fulfilment',
    'GET',
    '/fulfilment/pickup-info',
    'Bearer required',
    'Checkout pickup panel. Customer cannot pick a production house.',
    'None',
    '{ "name?": "string", "address?": "string", "instructions?": "string", "hours?": "string", "phone?": "string", "lat?": "number", "lng?": "number" }',
    'Implemented',
    'Backend assigns production house.',
  ],
  [
    'Store credit',
    'GET',
    '/store-credit',
    'Bearer required',
    'Store Credit screen and Checkout StoreCreditCard.',
    'None',
    '{ "balancePaise": "number", "history?": [{ "id?": "string", "label?": "string", "amountPaise?": "number", "createdAtLabel?": "string" }] }',
    'Implemented',
    'Ledger is backend-owned. Apply/remove are cart endpoints above.',
  ],
  [
    'Checkout',
    'POST',
    '/checkout',
    'Bearer required',
    'Checkout “Continue to Payment”. Does NOT open Razorpay. Creates checkout/payment draft.',
    'Headers: Idempotency-Key: <uuid>. Body: { "idempotencyKey": "uuid", "fulfilment": "DELIVERY|PICKUP", "asap": "boolean", "addressId?": "string", "slotId?": "string", "coupon?": "string", "storeCredit?": { "max": true } }',
    '{ "checkoutId": "string", "amountPaise": "number", "currency?": "INR", "razorpayOrderId?": "string", "keyId?": "string", "orderDraftId?": "string", "paymentIntentId?": "string", "message?": "string" }',
    'Implemented',
    '[CONFIRM] exact field names and whether Idempotency-Key header, body, or both. Same UUID reused on retry. Invalid cart must 4xx so payment cannot start.',
  ],
  [
    'Payment',
    'POST',
    '/payments/razorpay/initiate',
    'Bearer required',
    'Payment screen Pay Now, only if checkout did not already return razorpayOrderId + amountPaise.',
    'Headers: Idempotency-Key. Body: { "checkoutId": "string", "idempotencyKey": "string" } Amount is NOT sent by the client.',
    '{ "razorpayOrderId": "string", "keyId": "string (Razorpay public key)", "amountPaise": "number", "currency?": "INR", "checkoutId?": "string" }',
    'Implemented',
    '[CONFIRM] if backend also requires amountPaise. Frontend never contains Razorpay secret. Never treat this as paid.',
  ],
  [
    'Payment',
    'POST',
    '/payments/razorpay/confirm',
    'Bearer required',
    'After Razorpay hosted UI success callback. THIS is authoritative payment success. Then Order Confirmation.',
    'Headers: Idempotency-Key. Body: { "checkoutId": "string", "idempotencyKey": "string", "razorpay_payment_id": "string", "razorpay_order_id?": "string", "razorpay_signature?": "string" }',
    '{ "verified": "boolean", "alreadyProcessed?": "boolean", "orderId?": "string", "orderNumber?": "string", "totalPaise?": "number", "fulfilment?": "DELIVERY|PICKUP", "locationLabel?": "string", "scheduleLabel?": "string", "paymentStatus?": "string", "message?": "string" } Also accepts success/confirmed/status=paid. App treats verified OR alreadyProcessed as success.',
    'Implemented',
    'Backend MUST verify Razorpay signature. Client forwards signature, never HMAC. No GET /payments/status. Uncertain UI retries THIS confirm only. Do not create a second checkout on retry.',
  ],
  [
    'Orders',
    'GET',
    '/orders',
    'Bearer required',
    'Orders hub. One visible tab at a time: Active / Past / Cancelled.',
    'Query: statusGroup=active|past|cancelled, page?',
    '{ "items": [{ "id": "string", "orderNumber?": "string", "status?": "string", "statusLabel": "string", "placedAt?": "string", "fulfilment?": "DELIVERY|PICKUP", "itemSummary?": "string", "totalPaise?": "number", "scheduleLabel?": "string", "trackingAvailable?": "boolean", "canReorder?": "boolean", "invoiceAvailable?": "boolean" }], "page": "number", "pageSize": "number", "total": "number", "hasMore": "boolean" }',
    'Implemented',
    '[CONFIRM] page vs cursor. Customer A must never see Customer B orders.',
  ],
  [
    'Orders',
    'GET',
    '/orders/{id}',
    'Bearer required',
    'Order Detail. Deep link /orders/{id}. Fetches by id only (no object in navigation).',
    'Path order id.',
    'OrderDetail: id, orderNumber?, status/statusLabel, paymentStatus?, fulfilment, location/address/pickup fields, scheduleLabel, items[{ id, productId?, name, imageUrl?, quantity, unitPricePaise?, lineTotalPaise?, optionsSummary?, reviewEligible? }], totals (paise), timeline[{ status, statusLabel, at?, message?, current? }], flags: trackingAvailable, riderAvailable, chatAvailable, callAvailable, canCancel, canReorder, invoiceAvailable, complaintAllowed, refundPaise?, message?',
    'Implemented',
    '403/404 → “Order not found” (do not reveal another customer’s order). All actions are backend-gated by these flags.',
  ],
  [
    'Orders — Cancel',
    'GET',
    '/orders/{id}/cancellation-eligibility',
    'Bearer required',
    'Order Detail cancel entry + Cancel screen.',
    'Path order id.',
    '{ "allowed": "boolean", "refundPaise?": "number", "message?": "string", "deadlineLabel?": "string", "policyLabel?": "string" }',
    'Implemented',
    'Frontend must not calculate refund, 30/60 min rules, or eligibility.',
  ],
  [
    'Orders — Cancel',
    'POST',
    '/orders/{id}/cancel',
    'Bearer required',
    'Cancel Order confirm. Duplicate tap blocked. Same idempotency key on retry.',
    'Headers: Idempotency-Key. Body: { "reasonCode": "ORDERED_BY_MISTAKE|CHANGED_MIND|DELIVERY_TAKING_TOO_LONG|OTHER", "otherText?": "string (when OTHER)", "idempotencyKey": "string" }',
    '{ "success": "boolean", "refundPaise?": "number", "refundStatus?": "string", "message?": "string" }',
    'Implemented',
    '[CONFIRM] reason codes. Backend owns refund.',
  ],
  [
    'Orders — Reorder',
    'POST',
    '/orders/{id}/reorder',
    'Bearer required',
    'Past order card / Order Detail. Navigates to Cart only if cartUpdated.',
    'Headers: Idempotency-Key. Body: { "idempotencyKey": "string" }',
    '{ "success": "boolean", "cartUpdated": "boolean", "changes?": [{ "type?": "string", "message?": "string", "productName?": "string" }], "message?": "string" }',
    'Implemented',
    'Must revalidate current price/availability/options/offers. Never checkout at old price.',
  ],
  [
    'Orders — Invoice',
    'GET',
    '/orders/{id}/invoice',
    'Bearer required',
    'Order Detail invoice button. Opens HTTPS URL in in-app browser. URL not logged.',
    'Path order id.',
    '{ "available": "boolean", "generating?": "boolean", "url?": "https URL", "message?": "string" }',
    'Implemented',
    'HTTPS only. No auth tokens attached to the PDF URL.',
  ],
  [
    'Tracking',
    'GET',
    '/orders/{id}/tracking',
    'Bearer required',
    'Tracking screen. Poll every 15s while focused and not delivered/cancelled/unavailable.',
    'Path order id.',
    '{ "available": "boolean", "status?": "string", "statusLabel?": "string", "etaLabel?": "string", "riderLat?": "number", "riderLng?": "number", "destinationLat?": "number", "destinationLng?": "number", "polyline?": [{ "lat": "number", "lng": "number" }], "updatedAt?": "string", "delivered?": "boolean", "cancelled?": "boolean", "message?": "string" }',
    'Implemented',
    'No customer GPS. No frontend ETA/route math. Encoded polyline strings are not decoded [CONFIRM]. No WebSocket.',
  ],
  [
    'Tracking — Rider',
    'GET',
    '/orders/{id}/rider',
    'Bearer required',
    'Tracking / Order Detail Call Rider. Display-safe fields only.',
    'Path order id.',
    '{ "displayName?": "string", "photoUrl?": "string", "rating?": "number", "callAllowed?": "boolean", "chatAllowed?": "boolean", "callNumber?": "string (dialable when callAllowed)", "message?": "string" }',
    'Implemented',
    'Do not send internal rider id, private assignment, or call tokens unless product confirms. Call-token-only [CONFIRM]. Number not logged.',
  ],
  [
    'Rider chat',
    'GET',
    '/orders/{id}/rider-chat/messages',
    'Bearer required',
    'Rider Chat screen. Poll 10s while focused. Separate from Support.',
    'Query: page? (page>1 only)',
    '{ "items": [{ "id": "string", "sender": "CUSTOMER|RIDER|SYSTEM", "text": "string", "createdAt?": "string" }], "page": "number", "pageSize": "number", "total": "number", "hasMore": "boolean", "available?": "boolean", "message?": "string" } Oldest → newest.',
    'Implemented',
    '[CONFIRM] page vs cursor. Hide unless order/chat flags allow.',
  ],
  [
    'Rider chat',
    'POST',
    '/orders/{id}/rider-chat/messages',
    'Bearer required',
    'Rider Chat send. Draft kept on failure. Send disabled while in flight.',
    '{ "text": "string" }',
    'Created message or 2xx then list refresh.',
    'Implemented',
    '',
  ],
  [
    'Notifications',
    'POST',
    '/devices/push-token',
    'Bearer required',
    'After auth + contextual permission grant. Native FCM/APNs token (not Expo push token).',
    '{ "token": "string", "platform": "ios|android" }',
    '{ "ok": true }',
    'Implemented',
    'No fake token. Duplicate same token skipped on client. Token delete/unbind on logout is [CONFIRM] — not called.',
  ],
  [
    'Notifications',
    'GET',
    '/notifications',
    'Bearer required',
    'Notifications inbox. Page pagination.',
    'Query: page?',
    '{ "items": [{ "id": "string", "title": "string", "body": "string", "createdAt?": "string", "read": "boolean", "type?": "string", "orderId?": "string", "ticketId?": "string", "orderItemId?": "string" }], "page": "number", "pageSize": "number", "total": "number", "hasMore": "boolean" } Deep-link fields may be nested under data/payload.',
    'Implemented',
    '[CONFIRM] envelope and type enum. Payload must be IDs only — no tokens, full orders, or support message bodies. Unknown type → stay in inbox.',
  ],
  [
    'Notifications',
    'POST',
    '/notifications/{id}/read',
    'Bearer required',
    'When a notification is opened, not when inbox opens.',
    'Path id. Empty body.',
    '2xx. App invalidates inbox + Home unread badge.',
    'Implemented',
    'POST /notifications/read-all is [CONFIRM] and not called.',
  ],
  [
    'Support',
    'GET',
    '/support/tickets',
    'Bearer required',
    'Support hub list. Customer’s tickets only.',
    'Query: page?',
    '{ "items": [{ "id": "string", "displayId?": "string", "status": "NEW|OPEN|PENDING|CLOSED", "preview?": "string", "orderId?": "string", "createdAt?": "string", "updatedAt?": "string" }], "page": "number", "pageSize": "number", "total": "number", "hasMore": "boolean" }',
    'Implemented',
    '[CONFIRM] pagination envelope. Ownership enforced server-side.',
  ],
  [
    'Support',
    'POST',
    '/support/tickets',
    'Bearer required',
    'Create ticket + Order complaint. Same idempotency key on retry.',
    'Headers: Idempotency-Key. Body: { "message": "string", "orderId?": "string", "reasonCode?": "string", "idempotencyKey": "string" }',
    '{ "ticketId": "string", "success?": "boolean", "message?": "string" }',
    'Implemented',
    'After create, app may POST up to 3 attachments. Complaint eligibility is order.complaintAllowed; dedicated eligibility API [CONFIRM].',
  ],
  [
    'Support',
    'GET',
    '/support/tickets/{id}',
    'Bearer required',
    'Ticket detail / deep link /support/{id}. Fetch by id only.',
    'Path ticket id.',
    '{ "id": "string", "displayId?": "string", "status": "NEW|OPEN|PENDING|CLOSED", "subject?": "string", "orderId?": "string", "replyAllowed": "boolean", "messages": [{ "id": "string", "actor": "customer|support", "body": "string", "createdAt?": "string" }] }',
    'Implemented',
    '403/404 → ticket not found. Closed tickets hide composer unless replyAllowed/canReply.',
  ],
  [
    'Support',
    'POST',
    '/support/tickets/{id}/messages',
    'Bearer required',
    'Ticket reply. No optimistic insert. Draft kept on failure.',
    '{ "message": "string" }',
    '2xx then GET ticket refresh.',
    'Implemented',
    '',
  ],
  [
    'Support',
    'POST',
    '/support/tickets/{id}/attachments',
    'Bearer required',
    'After ticket create, up to 3 evidence photos (complaint + create ticket).',
    'multipart/form-data field name "file": { uri, name, type=image/jpeg|image/png|image/webp }',
    '2xx per file.',
    'Implemented',
    '[CONFIRM] FormData field name (app sends "file"). Max 3. JPG/PNG/WEBP only. Size limit backend. No executables.',
  ],
  [
    'Legal',
    'GET',
    '/legal/{type}',
    'Public — do not require auth; do not attach tokens to any returned URL',
    'Legal hub documents.',
    'Path type = terms | privacy | refund | cancellation',
    '{ "title?": "string", "content?": "markdown or plain text", "url?": "https URL" }',
    'Implemented',
    '[CONFIRM] URL vs markdown. HTTPS URL opened in in-app browser with no auth headers. HTML stripped, not executed. All four types required.',
  ],
];

const notCalled = [
  [
    'Not called (do not build for this app unless product confirms)',
    'POST',
    '/products/quote',
    '—',
    'Not used. Displayed price comes from product/options payload.',
    '—',
    '—',
    'Not called',
    '[CONFIRM] leftover from earlier analysis.',
  ],
  [
    'Not called (do not build for this app unless product confirms)',
    'POST',
    '/cart/merge',
    '—',
    'No guest local cart, so no merge after OTP.',
    '—',
    '—',
    'Not called',
    '[CONFIRM]',
  ],
  [
    'Not called (do not build for this app unless product confirms)',
    'GET',
    '/payments/status',
    '—',
    'Uncertain payment retries POST /payments/razorpay/confirm only.',
    '—',
    '—',
    'Not called',
    'Do not invent a poll.',
  ],
  [
    'Not called (do not build for this app unless product confirms)',
    'POST',
    '/notifications/read-all',
    '—',
    'Inbox marks one notification read on open.',
    '—',
    '—',
    'Not called',
    '[CONFIRM]',
  ],
  [
    'Not called (do not build for this app unless product confirms)',
    'DELETE',
    '/devices/push-token',
    '—',
    'Logout clears local token cache only.',
    '—',
    '—',
    'Not called',
    '[CONFIRM] unbind contract.',
  ],
  [
    'Out of scope',
    '—',
    'Custom cake / quote / referral / admin / rider-app APIs',
    '—',
    'Customer app must not include these.',
    '—',
    '—',
    'Out of scope',
    'GUNUCO product decisions.',
  ],
];

const errors = [
  ['OTP_INVALID / OTP_EXPIRED', 'Auth OTP screens'],
  ['PHONE_CHANGE_INVALID / PHONE_IN_USE / PHONE_CHANGE_FAILED', 'Change phone'],
  ['CATEGORY_UNAVAILABLE / CATEGORY_INACTIVE / CATEGORY_NOT_FOUND', 'Catalogue'],
  ['PRODUCT_UNAVAILABLE / PRODUCT_INACTIVE / PRODUCT_NOT_FOUND', 'Product'],
  ['OPTION_UNAVAILABLE / OPTION_INVALID / OPTION_REQUIRED / VARIANT_UNAVAILABLE / INVALID_OPTIONS', 'Product options / add cart'],
  ['QUANTITY_UNAVAILABLE / QUANTITY_EXCEEDED / QUANTITY_LIMIT', 'Cart qty'],
  ['PRICE_CHANGED / CART_PRICE_CHANGED / CART_UNAVAILABLE / CART_ITEM_UNAVAILABLE / CART_INVALID', 'Cart / checkout'],
  ['COUPON_INVALID / COUPON_NOT_FOUND / COUPON_EXPIRED / COUPON_MIN_ORDER / COUPON_NOT_ELIGIBLE / COUPON_ALREADY_APPLIED / COUPON_STACKING', 'Coupon'],
  ['NOT_SERVICEABLE / LOCATION_NOT_SERVICEABLE / SERVICEABILITY_FAILED', 'Fulfilment'],
  ['SLOT_UNAVAILABLE / SLOT_INVALID', 'Slots'],
  ['CHECKOUT_EXPIRED / CHECKOUT_INVALID', 'Checkout / payment'],
  ['PAYMENT_FAILED / PAYMENT_CANCELLED / PAYMENT_VERIFICATION_FAILED / PAYMENT_ALREADY_PROCESSED / PAYMENT_TIMEOUT', 'Payment'],
  ['STORE_CREDIT_INSUFFICIENT / STORE_CREDIT_INVALID', 'Store credit'],
  ['ADDRESS_INVALID / ADDRESS_NOT_FOUND', 'Addresses'],
  ['WISHLIST_UNAVAILABLE / WISHLIST_NOT_FOUND', 'Wishlist'],
  ['REVIEW_NOT_ELIGIBLE / ALREADY_REVIEWED / REVIEW_INVALID', 'Reviews'],
  ['ORDER_NOT_FOUND / CANCELLATION_NOT_ALLOWED / REORDER_FAILED / INVOICE_UNAVAILABLE / INVOICE_GENERATING', 'Orders'],
  ['TRACKING_UNAVAILABLE / CHAT_UNAVAILABLE / CALL_UNAVAILABLE / COMPLAINT_NOT_ALLOWED', 'Tracking / rider / complaint'],
  ['TICKET_NOT_FOUND / TICKET_CLOSED / REPLY_NOT_ALLOWED', 'Support'],
  ['NOTIFICATION_NOT_FOUND', 'Notifications'],
  ['PROFILE_UPDATE_INVALID / PROFILE_UPDATE_FAILED', 'Profile'],
];

const headers = [
  'Feature',
  'Method',
  'API URL',
  'Auth',
  'Usage (what the customer app expects this API for)',
  'Request payload / query',
  'Expected response',
  'App status',
  'Notes for backend',
];

function styleHeader(row) {
  row.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  row.height = 32;
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5C3A2E' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF3F2A22' } },
      left: { style: 'thin', color: { argb: 'FF3F2A22' } },
      bottom: { style: 'thin', color: { argb: 'FF3F2A22' } },
      right: { style: 'thin', color: { argb: 'FF3F2A22' } },
    };
  });
}

function applyBody(row, alt) {
  row.alignment = { vertical: 'top', wrapText: true };
  row.height = 72;
  row.eachCell((cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1F1F1F' }, bold: colNumber === 1 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: alt ? 'FFF7F3EE' : 'FFFFFFFF' },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE6DDD4' } },
      left: { style: 'thin', color: { argb: 'FFE6DDD4' } },
      bottom: { style: 'thin', color: { argb: 'FFE6DDD4' } },
      right: { style: 'thin', color: { argb: 'FFE6DDD4' } },
    };
  });
}

const workbook = new ExcelJS.Workbook();
workbook.creator = 'GUNUCO Customer App';
workbook.created = new Date();

const cover = workbook.addWorksheet('How to use', {
  views: [{ showGridLines: false }],
  properties: { tabColor: { argb: 'FF5C3A2E' } },
});
cover.mergeCells('A1:F1');
cover.getCell('A1').value = 'GUNUCO Customer App — Backend API contract';
cover.getCell('A1').font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF5C3A2E' } };
cover.getRow(1).height = 28;
cover.mergeCells('A2:F2');
cover.getCell('A2').value =
  'Submit this workbook to backend. Paths are logical (prepend EXPO_PUBLIC_API_BASE_URL). Field names marked [CONFIRM] are what the app currently sends/reads, not a locked OpenAPI.';
cover.getCell('A2').alignment = { wrapText: true };
cover.getRow(2).height = 36;

const coverRows = [
  ['Convention', 'Rule'],
  ['Money', 'All payable amounts are integer paise. Do not send rupees or floats for prices/totals/fees/tax/refunds.'],
  ['Auth', 'Anonymous auth OTP: no Bearer. Public browse: works without token; attach Bearer if logged in. Private: Bearer required. 401 → refresh then retry; refresh fail → sign out.'],
  ['Idempotency', 'Checkout, payment initiate/confirm, cancel, reorder, support create: send Idempotency-Key header AND body idempotencyKey (confirm which you require). Reuse the same key on retry.'],
  ['Envelope', 'App accepts { data }, domain wrapper ({ cart }, { product }, { customer }), or a bare object.'],
  ['Errors', 'JSON { code, message }. Safe customer message. Do not return SQL, stacks, correlation IDs, or JWT internals to the client.'],
  ['Ownership', 'Orders, tickets, cart, wishlist, notifications, addresses, store credit are customer-scoped. Other customer IDs → 403/404 as not found.'],
  ['Not in this app', 'Custom cake, referral, admin, rider-app, guest cart merge, payment status poll, read-all notifications, profile image upload.'],
];
cover.getRow(4).values = ['', ...coverRows[0]];
styleHeader(cover.getRow(4));
cover.getCell('B4').value = 'Convention';
cover.getCell('C4').value = 'Rule';
cover.mergeCells('C4:F4');
coverRows.slice(1).forEach((pair, i) => {
  const r = 5 + i;
  cover.getCell(`B${r}`).value = pair[0];
  cover.mergeCells(`C${r}:F${r}`);
  cover.getCell(`C${r}`).value = pair[1];
  cover.getRow(r).alignment = { wrapText: true, vertical: 'top' };
  cover.getRow(r).height = 36;
  cover.getCell(`B${r}`).font = { bold: true, name: 'Calibri', size: 10 };
  cover.getCell(`C${r}`).font = { name: 'Calibri', size: 10 };
  const fill = i % 2 ? 'FFF7F3EE' : 'FFFFFFFF';
  ['B', 'C', 'D', 'E', 'F'].forEach((col) => {
    cover.getCell(`${col}${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  });
});
cover.getColumn(1).width = 3;
cover.getColumn(2).width = 22;
cover.getColumn(3).width = 28;
cover.getColumn(4).width = 22;
cover.getColumn(5).width = 22;
cover.getColumn(6).width = 22;

const sheet = workbook.addWorksheet('APIs by Feature', {
  views: [{ state: 'frozen', ySplit: 3, showGridLines: false }],
  properties: { tabColor: { argb: 'FF5C3A2E' } },
});
sheet.mergeCells('A1:I1');
sheet.getCell('A1').value = 'Feature';
sheet.getCell('A1').font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5C3A2E' } };
sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
sheet.getRow(1).height = 26;
sheet.mergeCells('A2:I2');
sheet.getCell('A2').value =
  'GUNUCO customer app (Android + iOS). Filter the Feature column. Implemented = already called by the app.';
sheet.getCell('A2').font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF5C3A2E' } };
sheet.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFE6DE' } };
sheet.getRow(2).height = 20;

sheet.getRow(3).values = headers;
styleHeader(sheet.getRow(3));

rows.forEach((row, i) => {
  const excelRow = sheet.addRow(row);
  applyBody(excelRow, i % 2 === 1);
});

sheet.autoFilter = {
  from: { row: 3, column: 1 },
  to: { row: 3 + rows.length, column: 9 },
};

const widths = [28, 10, 38, 28, 42, 48, 52, 14, 40];
widths.forEach((w, i) => {
  sheet.getColumn(i + 1).width = w;
});

const skip = workbook.addWorksheet('Not called - out of scope', {
  views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
});
skip.getRow(1).values = headers;
styleHeader(skip.getRow(1));
notCalled.forEach((row, i) => {
  const excelRow = skip.addRow(row);
  applyBody(excelRow, i % 2 === 1);
  excelRow.height = 48;
});
widths.forEach((w, i) => {
  skip.getColumn(i + 1).width = w;
});
skip.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1 + notCalled.length, column: 9 } };

const errSheet = workbook.addWorksheet('Error codes', {
  views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
});
errSheet.getRow(1).values = ['Business error code (send in JSON body.code)', 'Used by'];
styleHeader(errSheet.getRow(1));
errors.forEach((pair, i) => {
  const r = errSheet.addRow(pair);
  applyBody(r, i % 2 === 1);
  r.height = 22;
});
errSheet.getColumn(1).width = 88;
errSheet.getColumn(2).width = 36;
errSheet.mergeCells('A20:B20');
errSheet.getCell('A20').value =
  'Unknown codes must still return a safe generic message. HTTP: 401 session, 403/404 not found, 409 conflict, 422 validation, 429 rate limit, 5xx server trouble. Never expose internals.';
errSheet.getCell('A20').alignment = { wrapText: true };
errSheet.getRow(20).height = 36;

await workbook.xlsx.writeFile(outPath);

const csvHeader = headers.join(',');
const csvBody = [...rows, ...notCalled]
  .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(','))
  .join('\n');
writeFileSync(join(__dirname, 'GUNUCO-Customer-App-Backend-API-Contract.csv'), `\uFEFF${csvHeader}\n${csvBody}`, 'utf8');
console.log(`Wrote ${outPath}`);
