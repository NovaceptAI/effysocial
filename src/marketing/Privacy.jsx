import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { Ph, Section } from './legal/LegalLayout';

// Written from what the product actually does (audited 14 Sep 2026): the providers
// the engine calls, what the database stores, where servers run, and how long logs
// and backups are kept. Update it whenever a provider, data store or retention period changes.
const SECTIONS = [
  ['who-we-are', 'Who we are'],
  ['what-we-collect', 'What we collect'],
  ['how-we-use-it', 'How we use it'],
  ['your-customers', 'Your customers’ data'],
  ['service-providers', 'Service providers'],
  ['where-data-is-stored', 'Where data is stored'],
  ['cookies', 'Cookies and browser storage'],
  ['retention', 'How long we keep data'],
  ['security', 'Security'],
  ['your-rights', 'Your rights'],
  ['deleting-your-data', 'Deleting your data'],
  ['google-api', 'Google API services'],
  ['children', 'Children'],
  ['changes', 'Changes to this policy'],
  ['grievance-officer', 'Grievance Officer'],
];

const PROVIDERS = [
  ['Amazon Web Services', 'Hosts the application and database; stores uploaded and generated media and encrypted backups', 'United States (servers); India (media and backups)'],
  ['Groq', 'Generates text: captions, scripts, brand suggestions, landing-page copy and assistant replies', 'United States'],
  ['Google (Gemini, Imagen, Veo)', 'Generates and edits images and video from your prompts and uploads', 'Google’s global infrastructure'],
  ['Pollinations', 'Backup image generation when Google is unavailable; receives the image prompt', 'Outside India'],
  ['ElevenLabs', 'Turns scripts into speech and provides voice options', 'United States / European Union'],
  ['Sync Labs', 'Lip-syncs speech to a person’s video for avatar and character clips', 'United States'],
  ['Resend', 'Sends verification and password-reset emails', 'United States'],
  ['Meta (Instagram, Facebook)', 'Only when you connect an account: reads insights and publishes the posts you choose', 'Meta’s global infrastructure'],
  ['LinkedIn', 'Only when you connect an account', 'LinkedIn’s global infrastructure'],
  ['Google (sign-in, Business Profile)', 'Only when you connect: manages your Business Profile listing', 'Google’s global infrastructure'],
  ['Google Fonts', 'Serves the site’s typefaces; your browser requests them directly, so Google receives your IP address', 'Google’s global infrastructure'],
];

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="How EffySocial collects, uses and protects personal data, written to reflect what the product actually does."
      sections={SECTIONS}
    >
      <Section id="who-we-are" title="Who we are">
        <p>
          EffySocial is operated by <Ph>Legal entity name</Ph>, <Ph>Registered address</Ph> (“EffySocial”, “we”, “us”).
          For the personal data of the people who use EffySocial we are the data fiduciary under India’s Digital Personal
          Data Protection Act, 2023. Questions about this policy: <Ph>Contact email</Ph>.
        </p>
      </Section>

      <Section id="what-we-collect" title="What we collect">
        <ul>
          <li><strong>Account details</strong> — your name, email address and password (stored only as a salted hash), your organisation and workspace names, and your role.</li>
          <li><strong>Brand and creative material</strong> — brand facts, logos, prompts, scripts and briefs, the images, videos and audio you upload, and the posts, images, videos and films generated for you.</li>
          <li><strong>Images, video and voices of people</strong> — portraits and clips you upload to create avatars, characters or personalised videos, and names and details of people such as dealers.</li>
          <li><strong>Marketing data you manage</strong> — leads (name, phone, email, notes, campaign tags), form submissions, campaigns, rules and budgets. Landing-page and link-in-bio views and clicks are counted without storing visitors’ IP addresses.</li>
          <li><strong>Connected accounts</strong> — when you connect Instagram, Facebook, LinkedIn or Google Business Profile we store the account name and identifiers and an access token, encrypted.</li>
          <li><strong>Usage and technical data</strong> — a record of AI features used and credits consumed, and web-server logs containing IP address, browser details and the pages requested.</li>
        </ul>
      </Section>

      <Section id="how-we-use-it" title="How we use it">
        <ul>
          <li>To provide EffySocial: store your work, generate content, and show analytics.</li>
          <li>To send your prompts, uploads and scripts to the AI providers listed below, only to produce what you asked for.</li>
          <li>To publish or read data on the accounts you connect, only when you instruct it.</li>
          <li>To keep accounts secure — for example limiting repeated sign-in attempts — and to investigate abuse.</li>
          <li>To send service emails such as verification and password resets.</li>
          <li>To meet legal obligations.</li>
        </ul>
        <p>We do not sell personal data, show advertising based on it, or use your content to train models of our own. Each AI provider handles the data we send under its own business terms.</p>
      </Section>

      <Section id="your-customers" title="Your customers’ data">
        <p>
          When your business adds data about its own customers — leads, form submissions, conversations or reviews — your
          business decides why and how that data is used, and we process it on your behalf. You are responsible for having a
          lawful basis and giving any notices required, including for photos, videos and voices of people you upload.
        </p>
      </Section>

      <Section id="service-providers" title="Service providers">
        <p>We share data only with providers that help run EffySocial, and only what each needs:</p>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface2 text-left text-ink">
              <tr><th className="px-3 py-2 font-semibold">Provider</th><th className="px-3 py-2 font-semibold">What it does for us</th><th className="px-3 py-2 font-semibold">Location</th></tr>
            </thead>
            <tbody>
              {PROVIDERS.map(([name, role, where]) => (
                <tr key={name} className="border-t border-line align-top">
                  <td className="px-3 py-2 font-semibold text-ink whitespace-nowrap">{name}</td>
                  <td className="px-3 py-2">{role}</td>
                  <td className="px-3 py-2">{where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>We may also disclose data when required by law, or to protect our users, our service or the public.</p>
      </Section>

      <Section id="where-data-is-stored" title="Where data is stored">
        <p>
          Our application servers and database run in the United States (AWS, Northern Virginia). Media files and backups are
          stored in India (AWS, Mumbai). Several providers above process data outside India. We transfer data abroad only as
          permitted under Indian law.
        </p>
      </Section>

      <Section id="cookies" title="Cookies and browser storage">
        <ul>
          <li><strong>Sign-in cookie</strong> (<code>novacept_session</code>) — keeps you signed in for up to 7 days. It is not readable by page scripts.</li>
          <li><strong>Theme preference</strong> — your light or dark choice, saved in your browser’s local storage.</li>
        </ul>
        <p>We use no advertising or analytics cookies.</p>
      </Section>

      <Section id="retention" title="How long we keep data">
        <ul>
          <li><strong>Account and workspace data</strong> — while your account is open, and deleted within <Ph>number of days</Ph> of a deletion request.</li>
          <li><strong>Database backups</strong> — rotated automatically; the oldest copies are removed after about eight weeks.</li>
          <li><strong>Media backups</strong> — kept until you ask us to delete your account or specific media.</li>
          <li><strong>Web-server logs</strong> — about 14 days.</li>
          <li><strong>Usage records</strong> — while your account is open, and longer only where the law requires records to be kept.</li>
        </ul>
      </Section>

      <Section id="security" title="Security">
        <p>
          Connections use HTTPS. Passwords are stored as salted hashes, connected-account tokens are encrypted, repeated
          sign-in attempts are limited, and databases are backed up and restore-tested. No system is perfectly secure; if a
          breach affects your personal data we will notify you and the authorities as the law requires.
        </p>
      </Section>

      <Section id="your-rights" title="Your rights">
        <p>Under the Digital Personal Data Protection Act, 2023 you can:</p>
        <ul>
          <li>ask what personal data we hold about you and how we use it;</li>
          <li>have it corrected, completed or updated;</li>
          <li>have it erased, and withdraw consent where we rely on consent;</li>
          <li>nominate someone to exercise these rights if you die or cannot act; and</li>
          <li>raise a grievance with our Grievance Officer, then with the Data Protection Board of India if unresolved.</li>
        </ul>
        <p>Write to the Grievance Officer below. We reply within <Ph>number of days</Ph>.</p>
      </Section>

      <Section id="deleting-your-data" title="Deleting your data">
        <ul>
          <li><strong>Disconnect an account</strong> — open Integrations and choose Disconnect. The stored token is removed straight away.</li>
          <li><strong>Remove EffySocial from Facebook or Instagram</strong> — in Facebook, go to Settings → Apps and websites and remove EffySocial. Then email us to delete any data we obtained through it.</li>
          <li><strong>Delete your account</strong> — email <Ph>Contact email</Ph> from the address on your account. We confirm the request and delete your account data, and remove it from backups as they rotate.</li>
        </ul>
      </Section>

      <Section id="google-api" title="Google API services">
        <p>
          EffySocial’s use and transfer of information received from Google APIs adheres to the{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>,
          including the Limited Use requirements. Data from your Google Business Profile is used only to show and manage that
          listing at your request. It is not used for advertising, sold, or used to train AI models.
        </p>
      </Section>

      <Section id="children" title="Children">
        <p>EffySocial is a business tool for people aged 18 or over. We do not knowingly collect personal data from children. If you believe a child has given us data, contact us and we will delete it.</p>
      </Section>

      <Section id="changes" title="Changes to this policy">
        <p>We will post changes here and update the date above. For significant changes we will also tell you by email or in the app before they apply. See also our <Link to="/terms">Terms of Service</Link>.</p>
      </Section>

      <Section id="grievance-officer" title="Grievance Officer">
        <p><Ph>Grievance Officer name</Ph><br /><Ph>Grievance Officer email</Ph><br /><Ph>Registered address</Ph></p>
      </Section>
    </LegalLayout>
  );
}
