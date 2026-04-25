// Shape must stay in sync with the Convex assets table schema.
export type AssetData = {
  titles: string[];
  chapters: Array<{ timestamp: string; title: string; summary: string }>;
  pullQuotes: string[];
  linkedInPost: string;
  showNotes: string;
};

export const DEMO_OUTPUTS: AssetData = {
  titles: [
    "Naval Ravikant: The Quiet Math Behind Building Real Wealth",
    "Why Most People Chase Money the Wrong Way — Naval's 3 Laws",
    "How to Build Wealth Without Getting Lucky, with Naval Ravikant",
    "5 Mental Models from Naval That Will Change How You Work",
    "\"Play Long Games With Long People\" — Naval Ravikant",
  ],

  chapters: [
    { timestamp: "00:00", title: "Wealth vs. money",           summary: "Naval explains why wealth is assets that earn while you sleep, not a paycheck." },
    { timestamp: "02:14", title: "The four types of leverage", summary: "Code, media, capital, and people — and the compounding returns of each." },
    { timestamp: "08:30", title: "Finding specific knowledge", summary: "How to identify the skills at the intersection of curiosity and market demand." },
    { timestamp: "15:42", title: "Equity over time-renting",   summary: "Why ownership is the only reliable path to financial independence." },
    { timestamp: "20:55", title: "Reading as an unfair edge",  summary: "Naval's case for deep reading as the highest-ROI habit available to anyone." },
    { timestamp: "25:10", title: "Happiness is a practice",    summary: "Reframing happiness from a destination to a daily trained skill." },
    { timestamp: "33:48", title: "Long games, long people",    summary: "How compound interest applies to relationships, reputation, and capital." },
    { timestamp: "39:20", title: "Judgment vs. information",   summary: "Why the ability to act on the right information matters more than having it." },
    { timestamp: "44:55", title: "Closing thoughts",           summary: "Naval's single piece of advice to his younger self." },
  ],

  pullQuotes: [
    "You're not going to get rich renting out your time. You must own equity — a piece of a business — to gain your financial freedom.",
    "Play long-term games with long-term people. Compound interest works in everything, not just money.",
    "Happiness is not something you pursue. It's something you practice. Every day you're either training to be miserable or training to be happy.",
    "Specific knowledge is found by pursuing your genuine curiosity, not by following what's hot.",
    "Read what you love until you love to read. That's the whole secret.",
  ],

  linkedInPost: `I spent 47 minutes with Naval Ravikant and walked away with a framework I wish I'd had a decade ago.

Three things stuck with me:

1. Wealth is not money. Wealth is assets that earn while you sleep — money is how we transfer time and wealth.

2. You're not going to get rich renting out your time. You must own equity — a piece of a business — to gain your financial freedom.

3. Specific knowledge is found by pursuing your genuine curiosity and passion, not by following what's hot.

The part I keep replaying: "Play long-term games with long-term people." Everything compounds — reputation, skills, relationships, capital. The ones who win are the ones who stay in the room.

If you're early in your career — or thinking about your next move — this episode is worth the full listen.

Full conversation on PostPod → link in comments`,

  showNotes: `Naval Ravikant joins us for a wide-ranging conversation on wealth, happiness, and the art of thinking long-term. Naval is the co-founder of AngelList and an early investor in companies including Twitter, Uber, and Notion.

In this episode:
- Understand why wealth is fundamentally different from income
- Discover the four types of leverage available to anyone today
- Learn how to identify your specific knowledge and why it compounds
- Explore why ownership beats time-renting every time
- Hear Naval's case for reading as the highest-ROI daily habit

About the guest:
Naval Ravikant is a serial entrepreneur and angel investor based in San Francisco. He co-founded AngelList and has been involved in over 100 companies as a founder or investor.

Timestamps:
00:00 — Wealth vs. money
02:14 — The four types of leverage
08:30 — Finding specific knowledge
15:42 — Equity over time-renting
20:55 — Reading as an unfair edge
25:10 — Happiness is a practice
33:48 — Long games, long people
39:20 — Judgment vs. information
44:55 — Closing thoughts

Subscribe so you don't miss the next episode.`,
};
