// Questions & answers: straight answers to what clients worry about, for both lanes.
// Names, prices and limits come from the app data so answers never drift from the product.
// Be honest: never promise outcomes, and say what T-Res doesn't do.
import { formatMoney } from "@/lib/format";
import { ONLINE_PLAN_LIMIT } from "@/lib/intakeScreens";
import { enrolledAgent, resolutionPlans } from "@/lib/mockData";

// "both" answers apply whichever way you work with us.
export type FaqLane = "both" | "self-serve" | "full-support";

export type FaqItem = {
  id: string;
  q: string;
  a: string[];
  lane: FaqLane;
  // How it applies to this taxpayer (Jordan), like Library entries.
  forYou?: string;
  links?: { label: string; href: string }[];
};

export type FaqGroup = { id: string; title: string; description: string; items: FaqItem[] };

export type FaqTab = "all" | "self-serve" | "full-support";

export const faqTabs: { key: FaqTab; href: string; label: string; hint: string }[] = [
  { key: "all", href: "/questions", label: "All questions", hint: "Everything, for both ways of working with us." },
  {
    key: "self-serve",
    href: "/questions/self-serve",
    label: "Doing it yourself",
    hint: "You deal with the IRS yourself, and T-Res prepares everything.",
  },
  {
    key: "full-support",
    href: "/questions/full-support",
    label: "Full support",
    hint: `${enrolledAgent.name}, an Enrolled Agent, represents you and deals with the IRS for you.`,
  },
];

const EA = enrolledAgent.name;
const limit = formatMoney(ONLINE_PLAN_LIMIT);
const price = (p: (typeof resolutionPlans)[number]) =>
  p.installments > 1
    ? `${formatMoney(p.price)}, or ${p.installments} payments of ${formatMoney(p.price / p.installments)}`
    : `${formatMoney(p.price)}, one time`;

export const faqGroups: FaqGroup[] = [
  {
    id: "how",
    title: "How T-Res works",
    description: "What we do, who's behind it, and how much is AI.",
    items: [
      {
        id: "what-is",
        lane: "both",
        q: "What is T-Res?",
        a: [
          "T-Res helps you resolve IRS tax debt. It reads your IRS letters and records, explains them in plain English, works out your options, and prepares every form and letter you need.",
          `There are two ways to use it. You can do it yourself: T-Res prepares everything, and you deal with the IRS through your own online account. Or you can have ${EA}, an Enrolled Agent, represent you and deal with the IRS for you.`,
        ],
      },
      {
        id: "who-is-ea",
        lane: "both",
        q: `Who is ${EA}?`,
        a: [
          `${EA} is an Enrolled Agent (EA): a tax professional licensed by the IRS itself. Enrolled Agents pass a three-part IRS exam, keep up with continuing education, and can represent taxpayers before the IRS in every state.`,
          `${EA} approves the rules and templates T-Res uses, personally reviews anything our checks flag, and represents you if you choose full support.`,
        ],
        links: [{ label: "Enrolled Agent in the Library", href: "/library/enrolled-agent" }],
      },
      {
        id: "how-much-ai",
        lane: "both",
        q: "How much of this is done by AI?",
        a: [
          "Most of the work. AI reads your letters and records, writes the plain-English explanations and drafts letters and forms. Anything about money, like balances, deadlines and whether you qualify for something, is worked out by fixed rules, not guessed by AI.",
          `Every AI result goes through PLCY, our governance system. Routine work that passes its checks is approved automatically, under rules ${EA} approved. Anything sent to the IRS under ${EA}'s name, and any advice about how much to pay, goes to ${EA} personally. ${EA} also spot-checks the rest.`,
        ],
      },
      {
        id: "badges",
        lane: "both",
        q: `What do "Checked by T-Res" and "Approved by ${EA}" mean?`,
        a: [
          `"Checked by T-Res" means the result passed our automated checks, such as matching the amounts on your IRS transcript, under rules ${EA} approved. The number shows how many checks it passed.`,
          `"Approved by ${EA}" means ${EA} looked at it personally and signed off. You'll see it on your resolution recommendation, on anything sent to the IRS under ${EA}'s name, and on Library entries.`,
        ],
      },
      {
        id: "which-option",
        lane: "both",
        q: `Should I do it myself, or have ${EA} represent me?`,
        a: [
          `You can do it yourself when four things are true: you owe ${limit} or less, at most two years' tax returns are missing, the IRS hasn't taken any money yet, and a payment plan fits your budget. In that case the IRS lets you set up a payment plan online, and T-Res gives you every answer.`,
          "If any of those isn't true, or you'd simply rather not deal with the IRS, full support is the better fit. The Get Started assessment checks this for you.",
        ],
        forYou: "You qualify to do it yourself: you owe about $25,900, only 2023 is unfiled, nothing has been taken, and about $440 a month fits your budget.",
        links: [{ label: "See your assessment", href: "/intake/assessment" }],
      },
      {
        id: "switch-lanes",
        lane: "both",
        q: "Can I switch between the two later?",
        a: [
          "Yes, in Billing & plan. What you've already paid counts toward the new plan.",
          `We also move you when it matters. If you're doing it yourself and a final levy notice arrives, or the IRS takes money, your case moves to ${EA} the same day. We won't change your plan or what you pay without asking you first.`,
        ],
        links: [{ label: "Billing & plan", href: "/settings/billing" }],
      },
      {
        id: "guarantee",
        lane: "both",
        q: "Can you guarantee a result, or get my debt reduced?",
        a: [
          'No, and be wary of anyone who does. The IRS decides whether to accept a payment plan, remove penalties or settle for less. The FTC warns people about tax relief companies that promise to settle debts for "pennies on the dollar".',
          "What we do promise is honesty: we'll tell you which options fit your situation, which don't, and why. Your assessment shows what we ruled out and the reasons.",
        ],
        links: [{ label: "What we ruled out for you", href: "/intake/assessment" }],
      },
      {
        id: "law-firm",
        lane: "both",
        q: "Is T-Res a law firm? Do I need a lawyer?",
        a: [
          "T-Res isn't a law firm and doesn't give legal advice. For most tax debt, like payment plans, penalty relief and IRS collection letters, an Enrolled Agent is the right professional.",
          "Talk to a tax attorney if the IRS is investigating you for fraud or a crime, or if you're considering bankruptcy. We'll tell you if we think you need one.",
        ],
      },
    ],
  },
  {
    id: "self-serve",
    title: "Doing it yourself",
    description: "You deal with the IRS directly. We prepare every answer, form and letter.",
    items: [
      {
        id: "ss-meaning",
        lane: "self-serve",
        q: 'What does "doing it yourself" actually involve?',
        a: [
          "You deal with the IRS directly, mostly online, and T-Res prepares everything: your missing returns, the exact answers for your payment plan application, and any letters to mail. You review, sign and submit.",
          "Your to-do list shows one step at a time, each with a due date and everything you need to finish it.",
        ],
        forYou: "Your steps: file your 2023 return, set up your payment plan, mail your CP504 reply, then send your penalty relief request.",
        links: [{ label: "Your to-dos", href: "/action-items" }],
      },
      {
        id: "ss-phone",
        lane: "self-serve",
        q: "Will I have to call the IRS?",
        a: [
          "Usually not. Payment plans can be set up online, and letters go by mail. If you ever choose to call, for example to ask for penalty relief, we give you a short script with exactly what to say.",
          "If the IRS writes asking for something, upload the letter. We'll tell you what it means and what to do.",
        ],
      },
      {
        id: "ss-online-account",
        lane: "self-serve",
        q: "What do I need for an IRS online account?",
        a: [
          "The IRS confirms your identity through ID.me. You'll need a photo ID, such as a driver's license or passport, and a phone. It usually takes a few minutes, but can take longer if ID.me needs a video call to confirm it's you.",
          "Your online account is also where you'll see your balance, your payment plan and copies of your IRS letters.",
        ],
        links: [{ label: "IRS online account in the Library", href: "/library/irs-online-account" }],
      },
      {
        id: "ss-plan-setup",
        lane: "self-serve",
        q: "How do I set up the payment plan myself?",
        a: [
          `If you owe ${limit} or less and every required return is filed, you can apply for a long-term payment plan in your IRS online account. You'll usually know right away whether it's approved.`,
          "We give you every answer to enter, including the monthly amount and your bank details for direct debit. The IRS charges a setup fee: it's lowest when you apply online and pay by direct debit, and it can be reduced or waived for lower incomes. When you're done, upload the confirmation so we can check it.",
        ],
        forYou: "About $440 a month by direct debit. Your 2023 return has to be filed first.",
        links: [{ label: "Payment plans in the Library", href: "/library/installment-agreement" }],
      },
      {
        id: "ss-mistake",
        lane: "self-serve",
        q: "What if I make a mistake on IRS.gov?",
        a: [
          "Upload the confirmation page when you're done. T-Res checks it against the answers we gave you: the amount, the tax years and the payment method.",
          `If anything doesn't match, ${EA} reviews it and tells you how to fix it. Most mistakes, like the wrong payment amount, can be corrected in your online account.`,
        ],
      },
      {
        id: "ss-ea-role",
        lane: "self-serve",
        q: `Is ${EA} involved at all if I do it myself?`,
        a: [
          `Yes, in the background. ${EA} approved every rule and template T-Res uses for you, spot-checks our work, and personally reviews anything our checks flag.`,
          `${EA} doesn't speak to the IRS for you in this option, so you won't sign Form 2848. If something serious happens, like a final levy notice, ${EA} steps in the same day.`,
        ],
      },
      {
        id: "ss-new-letter",
        lane: "self-serve",
        q: "What happens if a new IRS letter arrives?",
        a: [
          "Upload it on the Notices page, or take a photo. We read it, explain it in plain English, and add any new steps to your to-do list.",
          `If it's a final notice before levy (an LT11 or Letter 1058), or the IRS has taken money, your case moves to ${EA} the same day. You'll just need to sign Form 2848 so ${EA} can act for you.`,
        ],
        links: [{ label: "Upload a letter", href: "/notices" }],
      },
      {
        id: "ss-who-signs",
        lane: "self-serve",
        q: "Who signs the letters and returns?",
        a: [
          `You do. In this option everything goes out under your name, never ${EA}'s. We write each letter from a template ${EA} approved, and you read and approve it before it's final.`,
        ],
      },
      {
        id: "ss-return",
        lane: "self-serve",
        q: "Will you prepare my missing tax return?",
        a: [
          "Yes. Upload your W-2s and 1099s and we prepare the return; you review it and e-file it. The IRS needs every required return filed before it approves a payment plan, so this usually comes first.",
          "Filing also stops the penalty for filing late from growing, and that penalty is usually much bigger than the one for paying late.",
        ],
        forYou: "We estimate about $4,900 owed for 2023. The return appears on your to-do list once your W-2s and 1099s are in.",
      },
      {
        id: "ss-too-complex",
        lane: "self-serve",
        q: "What if my situation is too complicated to do myself?",
        a: [
          `We'll tell you, and why. Owing more than ${limit}, several unfiled years, money already taken, or not being able to afford a payment plan usually means you're better off with an Enrolled Agent.`,
          "Settling for less (an Offer in Compromise), pausing collection and appeals are also best handled with representation.",
        ],
      },
    ],
  },
  {
    id: "full-support",
    title: `Full support with ${EA}`,
    description: `${EA} represents you and deals with the IRS for you.`,
    items: [
      {
        id: "fs-what",
        lane: "full-support",
        q: `What does ${EA} do that I can't do myself?`,
        a: [
          `As your representative, ${EA} speaks to the IRS for you, so you don't take their calls. That includes asking for a hold on collection, negotiating a payment plan the online system can't approve, requesting penalty relief, requesting a hearing, and asking for a lien to be withdrawn.`,
          `${EA} also handles the harder options: settling for less (an Offer in Compromise), pausing collection when you can't pay anything (Currently Not Collectible), and appeals.`,
        ],
        links: [
          { label: "Offer in Compromise", href: "/library/offer-in-compromise" },
          { label: "Currently Not Collectible", href: "/library/currently-not-collectible" },
        ],
      },
      {
        id: "fs-2848",
        lane: "full-support",
        q: `What is Form 2848, and what can ${EA} do with it?`,
        a: [
          `Form 2848 is a power of attorney. It lets ${EA} speak to the IRS for you, get copies of your IRS letters, and act on the tax years it lists.`,
          `It doesn't let anyone cash or deposit your refund checks, and ${EA} can't sign your tax returns for you. You can cancel it at any time by telling us or the IRS.`,
        ],
        links: [{ label: "Form 2848 in the Library", href: "/library/form-2848" }],
      },
      {
        id: "fs-letters",
        lane: "full-support",
        q: "Will I still get letters from the IRS?",
        a: [
          `Yes. The IRS keeps writing to you, and sends ${EA} copies. Upload any letter you get so we can match it to your case. You don't need to reply yourself unless we ask you to.`,
        ],
      },
      {
        id: "fs-speed",
        lane: "full-support",
        q: `How quickly does ${EA} respond?`,
        a: [
          "Within one business day for anything routine, like reviewing a document or answering a note. The same day for emergencies, like a final levy notice or money taken from your pay or bank account.",
        ],
      },
      {
        id: "fs-levy",
        lane: "full-support",
        q: `Can ${EA} stop a levy or wage garnishment?`,
        a: [
          "Often, yes. When a final levy notice (an LT11 or Letter 1058) arrives, you have 30 days to ask for a Collection Due Process hearing, which generally pauses levies while it's decided. While a payment plan is in place, the IRS generally can't levy either.",
          `If money has already been taken, ${EA} can ask the IRS to release the levy, for example because it's causing hardship. Nobody can promise the IRS will agree, but acting quickly gives you the best chance.`,
        ],
        links: [
          { label: "Levy in the Library", href: "/library/levy" },
          { label: "Collection Due Process hearing", href: "/library/cdp-hearing" },
        ],
      },
      {
        id: "fs-my-part",
        lane: "full-support",
        q: "What do I still have to do?",
        a: [
          `Sign Form 2848, upload the documents ${EA} asks for, and approve letters before they're sent. Your to-do list shows each one.`,
          "Keep up with this year's taxes, too: file on time and pay what you owe, or adjust your withholding. A payment plan can be cancelled if new taxes go unpaid.",
        ],
        links: [{ label: "Your to-dos", href: "/action-items" }],
      },
      {
        id: "fs-who-works",
        lane: "full-support",
        q: `Is ${EA} doing all the work on my case?`,
        a: [
          `${EA} is responsible for everything sent to the IRS under ${EA}'s name. T-Res does the preparation: reading your records, working out the numbers and drafting letters and forms. ${EA} reviews and approves it. That's how we keep your case moving fast and the cost down.`,
        ],
      },
    ],
  },
  {
    id: "cost",
    title: "Cost, billing and cancelling",
    description: "What you pay, what it covers, and how to stop.",
    items: [
      {
        id: "cost",
        lane: "both",
        q: "How much does T-Res cost?",
        a: [
          ...resolutionPlans.map((p) => `${p.name}: ${price(p)}. ${p.blurb}`),
          `You aren't charged until ${EA} confirms your plan.`,
        ],
        links: [{ label: "Compare plans", href: "/settings/billing" }],
      },
      {
        id: "fee-irs",
        lane: "both",
        q: "Does any of my fee go to the IRS?",
        a: [
          "No. Our fee is separate from what you owe the IRS, and from any IRS setup fee for a payment plan. Everything you pay the IRS goes toward your tax balance, and we never handle your payments to the IRS.",
        ],
      },
      {
        id: "change-plan",
        lane: "both",
        q: "Can I change my plan?",
        a: [
          "Yes, any time, in Billing & plan. Upgrades and downgrades both count what you've already paid toward the new plan. If you've paid more than the new plan costs, we refund the difference.",
        ],
        links: [{ label: "Billing & plan", href: "/settings/billing" }],
      },
      {
        id: "cancel",
        lane: "both",
        q: "Can I cancel? What happens if I do?",
        a: [
          `Yes, any time, in Billing & plan: no phone call, and no reason needed. You won't be charged again, and the rest of your plan is canceled. If ${EA} represents you, ${EA} stops work and tells the IRS.`,
          "Your IRS deadlines still apply after you cancel. You keep access to your documents and notes for 12 months. You can also pause payments for 30 days instead.",
        ],
        links: [{ label: "Cancel or pause", href: "/settings/billing/cancel" }],
      },
      {
        id: "guarantee-money",
        lane: "both",
        q: "Do you offer a money-back guarantee?",
        a: [
          "No, because no one can promise what the IRS will decide, and we'd rather be honest about that. What you pay covers the work we do, and you can cancel any time without paying for the rest of your plan.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "Security and privacy",
    description: "Who can see your case, and what we do with your information.",
    items: [
      {
        id: "data-safe",
        lane: "both",
        q: "Is my information safe?",
        a: [
          "Your account uses two-step verification: we text you a code when you sign in on a new device, and again before you sign anything. Settings → Security shows every device that's signed in.",
          `Only you and ${EA} can see your case, and every action on it is logged.`,
        ],
        links: [{ label: "Security settings", href: "/settings/security" }],
      },
      {
        id: "ai-training",
        lane: "both",
        q: "Do you use my information to train AI?",
        a: [
          "No. Your tax information is used only to work on your case. Tax professionals need your written consent to use your tax return information for anything else, and we don't ask for it.",
        ],
      },
      {
        id: "form-8821",
        lane: "both",
        q: "What can you do with the Form 8821 I signed?",
        a: [
          "Form 8821 lets T-Res see your IRS records, like transcripts and notices, so we can prepare everything accurately. It's read-only: we can't change anything, make payments or speak for you with it. You can cancel it at any time.",
        ],
        links: [{ label: "Form 8821 in the Library", href: "/library/form-8821" }],
      },
      {
        id: "notes",
        lane: "both",
        q: "Who can read my documents and notes?",
        a: [
          `You and ${EA}. Notes on a document are shared with ${EA}, who answers within one business day. You can edit or delete your own notes at any time.`,
        ],
        links: [{ label: "Your documents", href: "/documents" }],
      },
    ],
  },
  {
    id: "irs",
    title: "The IRS and what you owe",
    description: "Levies, liens, penalties, and what the IRS can and can't do.",
    items: [
      {
        id: "levy-warning",
        lane: "both",
        q: "Will the IRS take my paycheck or bank account?",
        a: [
          "Not without warning. The IRS sends a series of letters first. After a CP504, it can take a state tax refund. Before it can take wages or money from a bank account, it must send a final notice (an LT11 or Letter 1058) and give you 30 days to ask for a hearing.",
          "Responding before those deadlines keeps your options open, and a payment plan generally stops levies while it's in place.",
        ],
        forYou: "You've had a CP504 for 2021. The IRS would have to send a final notice before it could take your wages or bank account.",
        links: [{ label: "Your notices", href: "/notices" }],
      },
      {
        id: "growing",
        lane: "both",
        q: "Will what I owe keep growing?",
        a: [
          "Yes, until it's paid. Interest is added daily, and the late-payment penalty adds up to 0.5% of the unpaid tax each month. While an approved payment plan is in place, that penalty drops to 0.25% a month if you filed on time.",
          "That's why getting a plan in place soon matters, even if the monthly amount is small.",
        ],
        links: [{ label: "Failure-to-pay penalty", href: "/library/failure-to-pay-penalty" }],
      },
      {
        id: "lien",
        lane: "both",
        q: "What is a tax lien, and will it hurt my credit?",
        a: [
          "A lien is the IRS's legal claim on your property for a tax debt. It's a public record, so it can come up when you sell property or apply for a loan.",
          "The major credit bureaus stopped including tax liens on credit reports in 2018. Once you're paying by direct debit, owe $25,000 or less and have made a few payments, you can usually ask for the lien to be withdrawn.",
        ],
        links: [
          { label: "Federal tax lien", href: "/library/federal-tax-lien" },
          { label: "Lien withdrawal", href: "/library/lien-withdrawal" },
        ],
      },
      {
        id: "forgive",
        lane: "both",
        q: "Can the IRS forgive what I owe?",
        a: [
          "Sometimes, but less often than ads suggest. An Offer in Compromise settles for less when you can't realistically pay the full amount. The IRS also generally has 10 years from assessment to collect; after that, whatever is left is wiped out.",
          "Penalties are easier to remove: First-Time Penalty Abatement can take them off if you had a clean record for the three years before.",
        ],
        links: [
          { label: "First-Time Abatement", href: "/library/first-time-abatement" },
          { label: "The 10-year collection limit", href: "/library/csed" },
        ],
      },
      {
        id: "trouble",
        lane: "both",
        q: "Can I get in trouble for not being able to pay?",
        a: [
          "Owing taxes you can't pay isn't a crime. The IRS handles it through collection: letters, liens and, if the letters are ignored, levies. Filing honestly and responding to letters is what matters most.",
          "Criminal cases involve things like deliberately hiding income or filing false returns. If that's a concern for you, talk to a tax attorney before anything else.",
        ],
      },
      {
        id: "state",
        lane: "both",
        q: "Do you handle state taxes?",
        a: [
          "Not yet. T-Res covers federal taxes owed to the IRS. If you also owe your state, tell us in a note on any document and we'll point you to your state's options.",
        ],
      },
    ],
  },
  {
    id: "urgent",
    title: "Letters, deadlines and emergencies",
    description: "What to do right now.",
    items: [
      {
        id: "new-letter",
        lane: "both",
        q: "I just got an IRS letter. What should I do?",
        a: [
          "Don't ignore it, and don't panic. Upload it on the Notices page or take a photo. We'll tell you what it is, what it means for you, and the deadline, in plain English.",
        ],
        links: [{ label: "Upload a letter", href: "/notices" }],
      },
      {
        id: "money-taken",
        lane: "both",
        q: "The IRS took money from my paycheck or bank account. What now?",
        a: [
          `Tell us right away: answer "Yes" to "Has the IRS taken money?" in Get Started, or upload the letter. ${EA} reviews your case the same day.`,
          "If it's your bank account, the bank usually holds the money for 21 days before sending it to the IRS, which gives time to ask for a release. A wage levy continues every payday until it's released, so act quickly.",
        ],
        links: [{ label: "Tell us now", href: "/intake/levy" }],
      },
      {
        id: "missed-deadline",
        lane: "both",
        q: "What if I've missed a deadline?",
        a: [
          'You usually still have options. For example, if you missed the 30 days to ask for a hearing after a final notice, you can generally ask for an "equivalent hearing" within one year. Upload the letter and we\'ll tell you what\'s still possible.',
        ],
        forYou: "Your Letter 3172 hearing window closed on Dec 17, 2025, but an equivalent hearing is still available until Nov 10, 2026.",
        links: [{ label: "Your Letter 3172", href: "/notices/ntc_l3172" }],
      },
    ],
  },
];

/** Groups and answers for a tab: a lane tab shows its own answers plus the ones for everyone. */
export function faqForTab(tab: FaqTab): FaqGroup[] {
  return faqGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => tab === "all" || i.lane === "both" || i.lane === tab) }))
    .filter((g) => g.items.length > 0);
}
