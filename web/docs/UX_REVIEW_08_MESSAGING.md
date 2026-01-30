# UX Review #8: Messaging System

**Review Date:** January 2025
**Status:** Complete
**Priority:** High (Core transaction enabler)

---

## Executive Summary

The messaging system is functional with product-contextual threads, polling-based updates, read receipts, and an Enter-to-send composer. However, it lacks the real-time feel and engagement features expected by modern marketplace users. Key gaps include no typing indicators, no read receipt UI, no email notifications for offline users, no suggested/template messages, and no image sharing within conversations.

**Key Findings:**
1. **Polling-based, not real-time** — 10-second polling in thread view creates noticeable lag
2. **No typing indicators** — Users don't know if the other person is composing
3. **No read receipts UI** — `readAt` is tracked in DB but never displayed to sender
4. **No email notifications** — Offline users have no way to know about new messages
5. **No image/file sharing** — Users can't send photos within conversation
6. **No suggested messages** — No quick reply templates for common questions
7. **Contact flow requires full page navigation** — "Pošalji poruku" navigates away from listing

---

## Current State Analysis

### Files Analyzed (15 files, ~1,588 lines)

| Category | Files | Lines |
|----------|-------|-------|
| Components | [message-bubble.tsx](../components/messages/message-bubble.tsx), [message-composer.tsx](../components/messages/message-composer.tsx), [message-thread-list.tsx](../components/messages/message-thread-list.tsx), [message-thread-view.tsx](../components/messages/message-thread-view.tsx), [messages-nav-link.tsx](../components/messages/messages-nav-link.tsx), [unread-badge.tsx](../components/messages/unread-badge.tsx) | 674 |
| Pages | [messages/page.tsx](../app/dashboard/messages/page.tsx), [messages/[threadId]/page.tsx](../app/dashboard/messages/%5BthreadId%5D/page.tsx) | 55 |
| API Routes | [threads/route.ts](../app/api/messages/threads/route.ts), [threads/[threadId]/route.ts](../app/api/messages/threads/%5BthreadId%5D/route.ts), [threads/[threadId]/messages/route.ts](../app/api/messages/threads/%5BthreadId%5D/messages/route.ts), [threads/[threadId]/read/route.ts](../app/api/messages/threads/%5BthreadId%5D/read/route.ts) | 586 |
| Contact | [contact-seller-form.tsx](../components/listings/contact-seller-form.tsx), [listing-contact-card.tsx](../components/listings/listing-contact-card.tsx) | 214 |
| Preview | [messages-preview.tsx](../app/dashboard/_components/messages-preview.tsx) | 159 |

### Current Architecture

```
Database:
  MessageThread (listing, buyer, seller, timestamps)
  └── Message[] (sender, body, readAt, createdAt)

Polling Pattern:
  Thread View:  10-second interval → GET /api/messages/threads/{id}
  Thread List:  30-second interval → GET /api/messages/threads
  Nav Badge:    30-second interval → GET /api/messages/threads (count)

Contact Flow:
  Listing Page → "Pošalji poruku" → POST /api/messages/threads → Redirect to /dashboard/messages/{id}
```

### Strengths Identified

1. **Product-contextual threads** — Every conversation tied to a specific listing with thumbnail
2. **Listing link in thread header** — Clickable listing image + title for quick reference
3. **Enter to send, Shift+Enter for newline** — Standard keyboard behavior
4. **Auto-scroll to latest message** — Smart scroll logic with requestAnimationFrame
5. **Mark as read on view** — Automatically marks messages read when thread is opened
6. **Unread badge system** — Count badge in nav, thread list, and dashboard preview
7. **Thread deduplication** — POST /threads returns existing thread if one exists
8. **Self-message prevention** — API blocks sellers from messaging themselves
9. **Message body validation** — 1-5000 character limit with Zod
10. **Loading skeletons** — Proper loading states for thread list and view
11. **Mobile back button** — ArrowLeft to return to thread list on mobile
12. **Auth-gated contact** — "Prijavite se" shown to unauthenticated users with callback URL

### Issues Identified

#### Critical UX Gaps

1. **No email notifications for new messages**
   - Users must be on the platform to know about new messages
   - Offline users have no way to know someone messaged them
   - Best practice: Email notification after X minutes of inactivity
   - **Impact:** Messages go unanswered → failed transactions

2. **10-second polling creates laggy experience**
   - Messages appear up to 10 seconds after being sent by other user
   - No visual indication of checking for new messages
   - Compare: WhatsApp/Messenger deliver in <1 second
   - **Impact:** Feels unresponsive, especially during active conversation

3. **Read receipts tracked but never shown**
   - `readAt` field exists in Message model and is set properly
   - But the UI never shows "seen" indicators to the sender
   - Users don't know if their message was read
   - **Impact:** Uncertainty, duplicate follow-up messages

#### High Priority Gaps

4. **No typing indicator**
   - Users don't know if the other person is composing a response
   - Creates anxiety during active conversations
   - Standard in all modern chat apps

5. **No image/file sharing in messages**
   - Users can't send photos within conversations
   - Common need: "Can you send more photos of the scratches?"
   - Must use external channels for this → users leave platform

6. **Contact requires full navigation away from listing**
   - Clicking "Pošalji poruku" creates thread and redirects to /dashboard/messages/
   - User loses context of the listing they were viewing
   - Better: Slide-in chat panel or modal on the listing page

7. **No suggested/quick reply messages**
   - No pre-written templates for common questions:
     - "Da li je cena fiksna?"
     - "Da li je moguća lična preuzimanje?"
     - "Da li imate dodatne fotografije?"
   - Reduces friction for first message

#### Medium Priority Gaps

8. **No push notifications**
   - No browser push notifications for new messages
   - Would improve responsiveness without email

9. **Thread list has no search**
   - Users with many threads can't search for specific conversations
   - No filter by listing or user name

10. **No message timestamps visible on every message**
    - Timestamps shown via relative time on hover/display
    - No date separators between messages from different days

11. **Textarea always shows 3 rows**
    - Fixed 3-row textarea takes up space even for short messages
    - Better: Start with 1 row, auto-expand to max 4

12. **No "last seen" or online status**
    - Users don't know if the other person is active on the platform
    - "Poslednji put viđen pre 2 sata" would set expectations

13. **No conversation archiving**
    - Users can't archive old/completed conversations
    - Thread list grows indefinitely

---

## Benchmark Comparison

### Chrono24

| Feature | Chrono24 | PolovniSatovi |
|---------|----------|---------------|
| Contextual threads | Yes | Yes |
| Real-time delivery | Yes (WebSocket) | Polling (10s) |
| Email notifications | Yes | No |
| Read receipts UI | Yes (checkmarks) | Tracked, not shown |
| Image sharing | Yes | No |
| Suggested messages | Yes | No |
| Offer system | Yes (in-chat) | No |
| Chat on listing page | Slide-in panel | Full redirect |

### Airbnb

| Feature | Airbnb | PolovniSatovi |
|---------|--------|---------------|
| Real-time messaging | Yes | Polling |
| Email fallback | Reply via email | No |
| Typing indicator | Yes | No |
| Read receipts | Yes | Tracked, not shown |
| Quick responses | Host templates | No |
| Booking requests | In-chat | N/A |
| Translation | Auto-translate | No |
| Push notifications | Yes | No |

### eBay

| Feature | eBay | PolovniSatovi |
|---------|------|---------------|
| Product context | Yes | Yes |
| Email notifications | Yes | No |
| Make an offer | In-chat | No |
| Image attachments | Yes | No |
| Canned responses | Yes | No |
| Message search | Yes | No |
| Block user | Yes | No |

---

## Prioritized Recommendations

### Critical Priority

#### CP1: Add Email Notifications for New Messages
**Impact:** Critical | **Effort:** 1-2 days

When a user receives a message and hasn't been active in 5+ minutes, send email notification via Brevo.

**Implementation:**
1. Track user's last active timestamp
2. On new message creation, check if recipient was active recently
3. If not, queue email notification with 5-minute delay (debounce)
4. Email includes: sender name, listing title, message preview, CTA button

**Files:** [threads/[threadId]/messages/route.ts](../app/api/messages/threads/%5BthreadId%5D/messages/route.ts), [lib/email.ts](../lib/email.ts)

```typescript
// After creating message in POST handler:
const recipientId = thread.buyerId === senderId ? thread.sellerId : thread.buyerId;

// Check if recipient was recently active (e.g., last 5 min)
// If not, send email notification
await queueMessageNotification({
  recipientId,
  senderName: sender.name,
  listingTitle: thread.listing.title,
  messagePreview: body.substring(0, 150),
  threadUrl: `${process.env.NEXTAUTH_URL}/dashboard/messages/${threadId}`,
});
```

#### CP2: Show Read Receipts in UI
**Impact:** High | **Effort:** 2-3 hours

Display "seen" indicator on sent messages using existing `readAt` data.

**Files:** [message-bubble.tsx](../components/messages/message-bubble.tsx)

```tsx
// Add to own messages:
{isOwn && message.readAt && (
  <span className="text-[10px] text-blue-500 flex items-center gap-0.5">
    <CheckCheck className="h-3 w-3" />
    Viđeno
  </span>
)}
{isOwn && !message.readAt && (
  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
    <Check className="h-3 w-3" />
    Poslato
  </span>
)}
```

**API change:** Include `readAt` in thread message response.

### High Priority

#### HP1: Add Quick Reply Templates
**Impact:** High | **Effort:** 3-4 hours

Show suggested first messages when opening a new conversation:

```tsx
const QUICK_REPLIES = [
  "Zdravo! Da li je ovaj sat još uvek dostupan?",
  "Da li je cena fiksna ili je moguć dogovor?",
  "Da li imate još fotografija?",
  "Gde se nalazite i da li je moguća lična predaja?",
];
```

**Files:** [message-composer.tsx](../components/messages/message-composer.tsx)

#### HP2: Add Image Sharing in Chat
**Impact:** High | **Effort:** 1-2 days

Allow users to send images within conversations:
- Add image upload button next to send button
- Upload to Supabase Storage (folder: "messages")
- Display inline with lightbox on click
- Max 3 images per message

**Database:** Add `attachments` field to Message model or create MessageAttachment model
**Files:** [message-composer.tsx](../components/messages/message-composer.tsx), [message-bubble.tsx](../components/messages/message-bubble.tsx)

#### HP3: Reduce Polling Interval or Add SSE
**Impact:** Medium | **Effort:** 1-3 days

Options (from easiest to best):
1. **Reduce polling to 3 seconds** during active conversation (easy)
2. **Server-Sent Events (SSE)** for message delivery (medium)
3. **WebSocket** with Supabase Realtime (advanced)

Recommended: Option 2 — SSE for new messages while keeping polling as fallback.

#### HP4: Auto-Resize Composer Textarea
**Impact:** Medium | **Effort:** 1 hour

Start with 1 row, expand to max 4 as user types:

```tsx
<Textarea
  rows={1}
  className="resize-none min-h-[44px] max-h-[120px]"
  style={{ height: 'auto', height: `${Math.min(ref.current?.scrollHeight || 44, 120)}px` }}
/>
```

### Medium Priority

#### MP1: Add Date Separators Between Messages
**Impact:** Medium | **Effort:** 2-3 hours

Insert date headers between messages from different days:
```
── Ponedeljak, 20. jan 2025 ──
[message bubbles]
── Danas ──
[message bubbles]
```

#### MP2: Add Thread Search
**Impact:** Medium | **Effort:** 3-4 hours

Search bar above thread list to filter by listing title or user name.

#### MP3: Add Chat Panel on Listing Page
**Impact:** Medium | **Effort:** 2-3 days

Instead of redirecting to /dashboard/messages, open a slide-in panel:
```
┌─────────────────────────┬──────────┐
│ Listing Page Content    │ Chat     │
│                         │ Panel    │
│ [Photos]                │ ───────  │
│ [Specs]                 │ Messages │
│ [Seller Info]           │          │
│                         │ [Input]  │
└─────────────────────────┴──────────┘
```

#### MP4: Add Conversation Archiving
**Impact:** Low | **Effort:** 3-4 hours

Allow users to archive completed conversations to keep thread list clean.

#### MP5: Add "Last Seen" Status
**Impact:** Low | **Effort:** 3-4 hours

Show when the other user was last active: "Poslednji put viđen pre 2 sata"

**Database:** Add `lastSeenAt` field to User model, update on each API request.

---

## Implementation Specifications

### Spec 1: Email Notification for New Messages (CP1)

**New utility: `lib/email-notifications.ts`**
```typescript
import { sendBrevoEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const NOTIFICATION_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function notifyNewMessage({
  recipientId,
  senderName,
  listingTitle,
  messagePreview,
  threadUrl,
}: {
  recipientId: string;
  senderName: string;
  listingTitle: string;
  messagePreview: string;
  threadUrl: string;
}) {
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { email: true, name: true, lastSeenAt: true },
  });

  if (!recipient?.email) return;

  // Only notify if user hasn't been active recently
  const lastSeen = recipient.lastSeenAt?.getTime() || 0;
  const isInactive = Date.now() - lastSeen > NOTIFICATION_COOLDOWN_MS;

  if (!isInactive) return;

  await sendBrevoEmail({
    to: [{ email: recipient.email, name: recipient.name || undefined }],
    subject: `Nova poruka od ${senderName} - ${listingTitle}`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Nova poruka</h2>
        <p style="color: #666;"><strong>${senderName}</strong> vam je poslao poruku u vezi oglasa:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="font-weight: 600; margin: 0 0 8px;">${listingTitle}</p>
          <p style="color: #666; margin: 0; font-style: italic;">"${messagePreview}${messagePreview.length >= 150 ? '...' : ''}"</p>
        </div>
        <a href="${threadUrl}" style="display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Odgovori na poruku
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Ovu poruku ste primili jer imate aktivan nalog na PolovniSatovi.
        </p>
      </div>
    `,
  });
}
```

**Integration in message POST route:**
```typescript
// After creating the message:
notifyNewMessage({
  recipientId,
  senderName: sender.name || "Korisnik",
  listingTitle: thread.listing.title,
  messagePreview: body.substring(0, 150),
  threadUrl: `${process.env.NEXTAUTH_URL}/dashboard/messages/${threadId}`,
}).catch(console.error); // Fire and forget
```

---

### Spec 2: Read Receipt UI (CP2)

**Update message-bubble.tsx:**
```tsx
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: {
    id: string;
    body: string;
    createdAt: Date | string;
    readAt?: Date | string | null;
    sender: { id: string; name: string | null; image: string | null };
  };
  isOwn: boolean;
}

// Inside the bubble, below timestamp:
{isOwn && (
  <span className="flex items-center gap-0.5 text-[10px]">
    {message.readAt ? (
      <>
        <CheckCheck className="h-3 w-3 text-blue-500" />
        <span className="text-blue-500">Viđeno</span>
      </>
    ) : (
      <>
        <Check className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">Poslato</span>
      </>
    )}
  </span>
)}
```

**API change:** Add `readAt` to message select in thread GET endpoint.

---

### Spec 3: Quick Reply Templates (HP1)

**Add to message-composer.tsx:**
```tsx
const QUICK_REPLIES = [
  { label: "Da li je dostupan?", text: "Zdravo! Da li je ovaj sat još uvek dostupan?" },
  { label: "Cena fiksna?", text: "Da li je cena fiksna ili je moguć dogovor?" },
  { label: "Više fotografija?", text: "Da li biste mogli da pošaljete još fotografija sata?" },
  { label: "Lična predaja?", text: "Gde se nalazite i da li je moguća lična predaja?" },
];

// Show only when no messages exist yet:
{isFirstMessage && (
  <div className="px-4 pb-2">
    <p className="text-xs text-muted-foreground mb-2">Brzi odgovori:</p>
    <div className="flex flex-wrap gap-1.5">
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply.label}
          type="button"
          className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors"
          onClick={() => setMessage(reply.text)}
        >
          {reply.label}
        </button>
      ))}
    </div>
  </div>
)}
```

---

### Spec 4: Date Separators (MP1)

**New helper component in message-thread-view.tsx:**
```tsx
function DateSeparator({ date }: { date: Date }) {
  const isToday = new Date().toDateString() === date.toDateString();
  const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString();

  const label = isToday
    ? "Danas"
    : isYesterday
    ? "Juče"
    : date.toLocaleDateString("sr-RS", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
      });

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// In message rendering, insert between messages from different days:
{thread.messages.map((message, i) => {
  const prevMessage = thread.messages[i - 1];
  const showDate = !prevMessage ||
    new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();

  return (
    <React.Fragment key={message.id}>
      {showDate && <DateSeparator date={new Date(message.createdAt)} />}
      <MessageBubble message={message} isOwn={message.sender.id === currentUserId} />
    </React.Fragment>
  );
})}
```

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Message response time | Unknown | < 4 hrs avg | Track time between messages |
| Reply rate (% of threads with seller reply) | Unknown | > 80% | DB query |
| Messages per transaction | Unknown | Baseline | Track threads→sold |
| Email notification open rate | N/A | > 40% | Brevo analytics |
| Contact-to-conversation rate | Unknown | > 70% | Track form clicks → threads |

---

## Research Sources

- [GetStream - Marketplace Chat Service](https://getstream.io/chat/solutions/marketplaces/)
- [CometChat - Marketplace Chat API](https://www.cometchat.com/solutions/marketplace)
- [RST Software - Buyer-to-Seller Chat](https://www.rst.software/blog/the-power-of-a-buyer-to-seller-chat-implementing-custom-live-chat-into-your-marketplace)
- [Sendbird - Marketplace Playbook](https://sendbird.com/resources/marketplace-playbook-a-guide-to-implementing-buyer-to-seller-chat)
- [TalkJS - Buyer Seller Chat](https://talkjs.com/use-cases/buyer-seller-chat-online-marketplaces/)
- [CometChat - Real-Time Messaging for Marketplaces](https://www.cometchat.com/blog/use-real-time-messaging-to-optimize-marketplace)
- [Sharetribe - Messaging for Marketplace Operations](https://www.sharetribe.com/academy/marketplace-operations-messaging/)
- [GetStream - In-App Chat Best Practices](https://getstream.io/blog/in-app-chat/)

---

## Next Steps

1. **Immediate:** Email notifications for new messages (CP1) — highest impact for engagement
2. **This week:** Read receipts UI (CP2), quick reply templates (HP1)
3. **Next sprint:** Image sharing (HP2), reduced polling or SSE (HP3)
4. **Backlog:** Chat panel on listing page, thread search, date separators

---

*Review completed. Proceed to Review #9: Mobile Experience*
