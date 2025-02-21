'use client';

import React, { useEffect } from 'react';
import { NavBar } from "../components/nav";
import { Footer } from "../components/footer";
import "./layout.css";

export default function Page() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const sections = [
    { id: "policy-overview", label: "Policy Overview" },
    { id: "data-collection", label: "How We Use Your Information" },
    { id: "sharing-information", label: "Sharing Your Information" },
    { id: "data-storage", label: "How We Store Your Information" },
    { id: "data-protection", label: "How We Protect Your Information" },
    { id: "international-data-transfer", label: "International Transfer of Your Data" },
    { id: "marketing", label: "Marketing" },
    { id: "data-rights", label: "Your Data Protection Rights" },
    { id: "cookies", label: "Cookies" },
    { id: "minors", label: "Data Storage for Minors" },
    { id: "policy-changes", label: "Changes to the Privacy Policy" },
    { id: "contact-us", label: "Contact Us" },
  ];

  return (
    <>
      <main className="privacy-main">
        {/* Left Column with Navigation */}
        <div className="privacy-left-column">
          <ul>
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(`#${id}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column with Content */}
        <div className="privacy-right-column">
          {sections.map(({ id, label }) => (
            <section id={id} key={id}>
              <h1>{label}</h1>
              {getSectionContent(id)}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

function getSectionContent(sectionId: string) {
  const content = {
    "policy-overview": (
      <>
        <p>As the data controller, OrgaGPS collects the following personal data from you in Germany:</p>
        <ul>
          <li>Personal identifiers such as your name, address, phone number, email address, and business details when you or your employer establishes an account.</li>
          <li>Interactions with us, such as comments, suggestions, requests regarding our products and services, or other types of communication or calls.</li>
          <li>Your usage patterns of our services, including in-app purchases like power-ups, quotations, or email subscriptions.</li>
          <li>Engagements with third-party entities, marketing partners, and affiliates including:</li>
          <ul>
            <li>Google Analytics, Google Adwords, Facebook Ads, LinkedIn Ads, Capterra, Fullstory, Mixpanel, Braintree, Stripe, Chargebee, Chartmogul, PayPal.</li>
          </ul>
          <li>Location-based data (GPS coordinates) through our geolocation feature when the employer requires users to log in with their GPS location.</li>
          <li>Biometric data via our facial recognition technology when employers mandate user login with a selfie.</li>
          <li>Time tracking and attendance data when you utilize the app.</li>
          <li>Marketing channels and campaigns that led you to OrgaGPS are recorded for marketing purposes.</li>
          <li>Your Internet Protocol (IP) address (when using a browser), your operating system, browser type, the address of a referring webpage, and device identifiers (when using a mobile device or tablet).</li>
        </ul>
        <p>The legal bases for collecting your data in this manner are:</p>
        <ul>
          <li>(a) You give your consent upon registration and accept our Terms and Conditions.</li>
          <li>(b) Processing your data in the described manner is necessary to provide OrgaGPS's services to users.</li>
          <li>(c) Part of this data is processed to protect our legitimate interests.</li>
        </ul>
      </>
    ),
    "data-collection": (
      <>
        <p>OrgaGPS acts as a data processor and uses personal data to enhance the quality of services we offer. Personal data are those entered by the client's end-users during service usage. The client is responsible for defining the purpose and means of processing the personal data, hence considered the "Controller" of the personal data. OrgaGPS is regarded as the "Processor."</p>
        <p>This includes, but is not limited to:</p>
        <ul>
          <li>Aligning your data with that of our partners to provide an enhanced and personalized app experience.</li>
          <li>Gathering location data (GPS coordinates) via our geolocation feature when employers require user check-in at their GPS location.</li>
          <li>Collecting biometric data through our facial recognition technology upon employer request.</li>
          <li>Recording time and presence data when you engage with the app.</li>
          <li>Utilizing information you provide in our communications, for example, to respond to your comments or inquiries, settle disputes, contact you regarding operational issues with the app or matters related to product or service transactions, address problems with the app or our services, and enforce our agreements with you.</li>
        </ul>
        <p>As a data processor, we may offer data processing agreements to team owners. If you are a team owner, you are obligated to comply with GDPR. It is the client's responsibility to obtain all necessary consents, appropriately inform their end-users, and comply with relevant data protection laws. You can request a data processing agreement by emailing support@orgagps.com.</p>
      </>
    ),
    "sharing-information": (
      <>
        <p>We do not share your personal data with third parties unless we have your permission or under the following circumstances:</p>
        <ul>
          <li>To facilitate the operation of the app and service and to provide associated services, which may include maintenance services, database management, web analytics, and improvement of service features, or to assist in analyzing how our app and service are used.</li>
          <li>We may share aggregated data that does not include personal data with third parties for industry analysis, demographic profiling, and other purposes.</li>
          <li>We are entitled to sell, transfer, or otherwise share some or all of our assets, including your personal data, in connection with a merger, acquisition, reorganization, or sale of assets or in the event of a corporate liquidation.</li>
        </ul>
      </>
    ),
    "data-storage": (
      <>
        <p>User data from OrgaGPS are stored in our AWS region in North Virginia, and OrgaGPS 2 is stored in the AWS region in Ireland. We retain user data as long as your account is active to provide you with the services under the contract with your company. User data are deleted from our servers once their organizations and accounts are deleted.</p>
        <p>Only authorized OrgaGPS personnel have access to user data. All data are encrypted using industry-standard techniques when stored on a disk or transmitted over the network. We also store log files and data for internal analysis to optimize the functionality and maintenance of our service. Except in situations where they are necessary for the security of the website or we are legally compelled to retain them for a longer period, user data are typically stored for a short duration.</p>
        <p>Please remember that you can contact us anytime at support@orgagps.com to permanently delete your personal data.</p>
      </>
    ),
    "data-protection": (
      <>
        <p>All data are encrypted using recognized, consistent, and adequate industry-standard methods when stored on a disk or transmitted over the network. Our user data are regularly backed up every 12 hours. OrgaGPS 1 archives are retained for three months, and OrgaGPS 2 archives for 30 days.</p>
        <p>At OrgaGPS Ltd., we take reasonable administrative, technical, and organizational measures to ensure an adequate level of security for personal data, considering the nature of the personal data, the processing we perform, and other relevant factors under the circumstances. Despite our best efforts, the internet is not free from security risks. As no data security system is entirely impenetrable, we cannot guarantee the security of our systems or databases. Accordingly, all information you send to or through the services is at your own risk.</p>
        <p>Please do your part to help us secure your data. We expressly reserve the right to terminate or cancel your access to the services and any contract you have entered into with us regarding the services if we find or suspect that you have disclosed your service account details to an unauthorized third party. You can always request the final deletion of your personal data.</p>
      </>
    ),
    "international-data-transfer": (
      <>
        <p>
          We may transfer your personal data to a third-party processor outside of the European Economic Area (EEA) or the country where you reside. By using our services and providing us with your data, you consent to the transfer and processing of your personal data by our third-party processors outside the EEA. For international data transfers, we only transfer your personal data to:
        </p>
        <ul>
          <li>Countries that ensure an adequate level of protection;</li>
          <li>Countries that implement adequate safeguards.</li>
        </ul>
        <p>
          Please be aware that countries outside the EEA may not offer the same level of data protection as the United Kingdom. However, please note that we maintain strict internal rules for the protection and processing of personal data, and our use is governed by this Privacy Policy.
        </p>
      </>
    ),
    "marketing": (
      <>
        <p>
          OrgaGPS provides users with various email notification services, including the "Daily Log," "Weekly Timesheet" reminder, and the "OrgaGPS Logged-In Reminder." You can manage your subscription preferences or unsubscribe from any of these services via your account settings page.
        </p>
      </>
    ),
    "data-rights": (
      <>
        <p>
          At OrgaGPS Ltd., we are committed to keeping you informed about your data protection rights. If you reside in the European Union or the United Kingdom, you are entitled to the following rights under the General Data Protection Regulation (GDPR):
        </p>
        <ul>
          <li>
            <strong>The Right to Withdraw Consent:</strong> You can withdraw your consent for data collection, processing, or sharing at any time by contacting us at <a href="mailto:support@orgagps.com">support@orgagps.com</a>. Upon notification, we will cease processing your data unless legally justified otherwise.
          </li>
          <li>
            <strong>The Right of Access:</strong> You can request copies of your personal data. A small administrative fee may apply in certain cases.
          </li>
          <li>
            <strong>The Right to Rectification:</strong> You can request corrections or updates to your data if you believe it is inaccurate or incomplete.
          </li>
          <li>
            <strong>The Right to Erasure:</strong> Under specific conditions, you can request the deletion of your personal data. For example:
            <ul>
              <li>If the data is no longer necessary for its original purpose.</li>
              <li>If the data was processed unlawfully.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            If you want to manage, update, or delete your data, contact us at <a href="mailto:support@orgagps.com">support@orgagps.com</a>.
          </li>
        </ul>
      </>
    ),
    "cookies": (
      <>
        <h3>What Are Cookies?</h3>
        <p>
          Cookies are small text files stored on your device when you visit a website. These files help the website remember your preferences and activities, improving your browsing experience. Cookies are not used to identify you personally but to enhance website functionality and analytics.
        </p>
        <h3>Types of Cookies We Use</h3>
        <ul>
          <li>
            <strong>First-Party Cookies:</strong> These are set by OrgaGPS and are essential for the website's core functionality.
          </li>
          <li>
            <strong>Third-Party Cookies:</strong> These are placed by external partners, such as Google and Facebook, for analytics and advertising purposes.
          </li>
        </ul>
        <h3>Managing Cookies</h3>
        <p>
          You can control and manage your cookie preferences using your browser settings. Note that disabling cookies may limit some features of our website. Helpful links for cookie management:
        </p>
        <p>
        <a href="https://support.google.com/chrome/answer/95647?hl=en" target="_blank" rel="noopener noreferrer">Chrome   </a>
        <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari   </a>
        <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Firefox   </a>
        <a href="https://help.opera.com/en/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer">Opera   </a>
        <a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Edge</a>
        </p>
      </>
    ),
    "minors": (
      <>
        <p>
          Our services are not intended for minors, and we do not knowingly collect their personal information. If we become aware that we have inadvertently collected data from minors, we will delete it promptly from our systems.
        </p>
      </>
    ),
    "policy-changes": (
      <>
        <p>
          We review and update our privacy policy regularly. Updates will be published on this page, and any significant changes will be communicated to you. Continued use of our services after updates signifies your acceptance of the revised policy.
        </p>
      </>
    ),
    "contact-us": (
      <>
        <p>
          If you have any questions about this privacy policy or the information we hold about you, feel free to contact us at <a href="mailto:support@orgagps.com">support@orgagps.com</a>.
        </p>
      </>
    ),
  };
    return content[sectionId] || <p>Content not available.</p>;
}