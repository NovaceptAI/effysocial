import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { Ph, Section } from './legal/LegalLayout';

const SECTIONS = [
  ['agreement', 'Agreement'],
  ['accounts', 'Accounts and workspaces'],
  ['plans', 'Plans, credits and fees'],
  ['your-content', 'Your content'],
  ['ai-content', 'AI-generated content'],
  ['likeness', 'People’s likeness and voice'],
  ['acceptable-use', 'Acceptable use'],
  ['connected-platforms', 'Connected platforms'],
  ['sandbox', 'Sandbox and preview features'],
  ['changes-to-service', 'Changes and availability'],
  ['termination', 'Suspension and termination'],
  ['disclaimers', 'Disclaimers'],
  ['liability', 'Limitation of liability'],
  ['indemnity', 'Indemnity'],
  ['law', 'Governing law'],
  ['changes-to-terms', 'Changes to these terms'],
  ['contact', 'Contact'],
];

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="The agreement between you and EffySocial for using the website and app."
      sections={SECTIONS}
    >
      <Section id="agreement" title="Agreement">
        <p>
          These terms are an agreement between you and <Ph>Legal entity name</Ph>, <Ph>Registered address</Ph> (“EffySocial”,
          “we”, “us”). By creating an account or using EffySocial you accept them. If you use EffySocial for an organisation,
          you confirm you are authorised to accept them on its behalf. You must be at least 18 years old.
        </p>
        <p>Our <Link to="/privacy">Privacy Policy</Link> explains how we handle personal data.</p>
      </Section>

      <Section id="accounts" title="Accounts and workspaces">
        <ul>
          <li>Keep your account details accurate and your password private. You are responsible for activity under your account.</li>
          <li>The account owner is responsible for the people they add to a workspace and the roles they give them.</li>
          <li>Tell us promptly at <Ph>Contact email</Ph> if you suspect unauthorised access.</li>
        </ul>
      </Section>

      <Section id="plans" title="Plans, credits and fees">
        <ul>
          <li>Plans include a monthly allowance of credits used by AI features such as image, video and voice generation. Allowances reset on the first of each month; unused credits do not carry over.</li>
          <li>Paid plans, production projects and managed services are charged as shown on the pricing page or in a written order, plus applicable taxes.</li>
          <li>Advertising spend on Meta, Google or other platforms is billed by those platforms and is separate from any EffySocial fee.</li>
        </ul>
      </Section>

      <Section id="your-content" title="Your content">
        <p>
          You keep ownership of what you upload and, to the extent the law and our providers allow, of the content generated
          for you. You give us permission to host, copy, process and transmit that content only as needed to run EffySocial
          for you, including sending it to the AI and publishing services described in the Privacy Policy. You confirm you
          have the rights needed for everything you upload.
        </p>
      </Section>

      <Section id="ai-content" title="AI-generated content">
        <ul>
          <li>Generated content can be inaccurate, similar to content made for others, or unsuitable. Review it before you publish or send it.</li>
          <li>You are responsible for what you publish, including advertising claims and any rules for your sector, such as financial or health claims.</li>
          <li>We do not promise any particular result — reach, leads, sales or return on spend.</li>
        </ul>
      </Section>

      <Section id="likeness" title="People’s likeness and voice">
        <ul>
          <li>Only upload photos, videos or recordings of a person — including for avatars, characters and personalised videos — if that person has agreed to that use.</li>
          <li>Do not use EffySocial to impersonate someone or to make it appear that a person said or endorsed something they did not.</li>
          <li>Label synthetic or AI-altered media wherever the law or the publishing platform requires it.</li>
          <li>We may remove content or suspend features if we believe these rules are broken.</li>
        </ul>
      </Section>

      <Section id="acceptable-use" title="Acceptable use">
        <p>You must not use EffySocial to:</p>
        <ul>
          <li>break the law, or infringe anyone’s intellectual property, privacy or publicity rights;</li>
          <li>send spam, or publish misleading or deceptive advertising;</li>
          <li>create content that is hateful or harassing, sexually explicit, or that involves minors in any sexual context;</li>
          <li>get around usage limits, security measures or access controls, or disrupt the service; or</li>
          <li>copy, resell or reverse engineer EffySocial without our written agreement.</li>
        </ul>
      </Section>

      <Section id="connected-platforms" title="Connected platforms">
        <p>
          When you connect Instagram, Facebook, LinkedIn, Google or other services, your use of them is also governed by their
          own terms. We are not responsible for those services, including their availability or decisions they make about your
          account, posts or ads.
        </p>
      </Section>

      <Section id="sandbox" title="Sandbox and preview features">
        <p>
          Some features show sandbox data, which is clearly labelled and is not real advertising spend or results. Features
          marked as preview or beta may change or be withdrawn, and are provided as they are.
        </p>
      </Section>

      <Section id="changes-to-service" title="Changes and availability">
        <p>We work to keep EffySocial available but do not guarantee uninterrupted service. We may change, add or remove features, and will give reasonable notice of changes that significantly reduce what a paid plan includes.</p>
      </Section>

      <Section id="termination" title="Suspension and termination">
        <p>
          You can stop using EffySocial at any time and ask us to delete your account. We may suspend or close an account that
          breaks these terms, has unpaid fees, or creates legal or security risk; where reasonable we will tell you first.
          After closure, data is handled as described in the <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </Section>

      <Section id="disclaimers" title="Disclaimers">
        <p>To the extent the law allows, EffySocial is provided “as is” and “as available”, without warranties of any kind, including fitness for a particular purpose, non-infringement or the accuracy of generated content.</p>
      </Section>

      <Section id="liability" title="Limitation of liability">
        <p>
          To the extent the law allows, we are not liable for indirect, incidental or consequential losses, or for lost profits,
          revenue or data. Our total liability for all claims relating to EffySocial is limited to the fees you paid us in the
          12 months before the claim, or <Ph>Liability cap amount</Ph> if you have paid nothing.
        </p>
      </Section>

      <Section id="indemnity" title="Indemnity">
        <p>You will cover our reasonable losses and costs from claims arising out of your content, your use of EffySocial in breach of these terms, or your use of any person’s likeness or voice without their agreement.</p>
      </Section>

      <Section id="law" title="Governing law">
        <p>These terms are governed by the laws of India. The courts at <Ph>City for courts</Ph> have exclusive jurisdiction.</p>
      </Section>

      <Section id="changes-to-terms" title="Changes to these terms">
        <p>We will post changes here and update the date above. For significant changes we will tell you by email or in the app before they apply. If you keep using EffySocial after that, the updated terms apply.</p>
      </Section>

      <Section id="contact" title="Contact">
        <p><Ph>Legal entity name</Ph><br /><Ph>Registered address</Ph><br /><Ph>Contact email</Ph></p>
      </Section>
    </LegalLayout>
  );
}
