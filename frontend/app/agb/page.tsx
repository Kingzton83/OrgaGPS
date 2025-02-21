'use client';

import React from 'react';
import "./layout.css";

export default function Impressum() {
    return (
        <div className="agb-page">
            <main className="main">
                <h1>Terms of Service for OrgaGPS</h1>

                <p>
                    By using the OrgaGPS and the OrgaGPS mobile app, web application, or website (the "Service"), you agree to the following terms (the "Terms of Service").
                </p>
                <p>
                    OrgaGPS reserves the right to update and modify these Terms of Service without prior notice. Any new features that enhance or extend the current Service, including the release of new tools and resources, are subject to these terms. Continued use of the Service after such changes constitutes your acceptance of the changes. The latest version of the Terms of Service can always be reviewed here.
                </p>
                <p>
                    Violating any of these terms will result in the termination of your account. By using the Service, you agree to do so at your own risk.
                </p>

                <h2>Terms of Use</h2>
                <ul>
                    <li>You must be of legal age in the state or province where you reside.</li>
                    <li>You must provide your full name, a valid email address or phone number, and any other required information to complete the registration process.</li>
                    <li>You are responsible for maintaining the security of your account and password. OrgaGPS cannot and will not be liable for any loss or damage resulting from your failure to comply with this security obligation.</li>
                    <li>You may not use the Service for any illegal or unauthorized purposes. You must not violate any laws in your jurisdiction, including but not limited to copyright laws, when using the Service.</li>
                </ul>

                <h2>Termination</h2>
                <ul>
                    <li>You can cancel your subscription at any time via the subscription page in the web app (web.orgagps.com).</li>
                    <li>
                        You can delete your account by contacting the OrgaGPS team via email at <a href="mailto:support@orgagps.com">support@orgagps.com</a>. Your account will then be deleted promptly, and confirmation will be sent to you via email.
                    </li>
                    <li>Upon account deletion, all your data will be immediately removed from the Service. This information cannot be recovered once deleted.</li>
                    <li>
                        OrgaGPS reserves the right to suspend or terminate your account and refuse any current or future use of the Service for any reason at its sole discretion. Termination of the Service will result in the deactivation or deletion of your account.
                    </li>
                </ul>

                <h2>Changes to the Service</h2>
                <ul>
                    <li>OrgaGPS reserves the right to modify or discontinue the Service (or any part of it) temporarily or permanently, with or without notice.</li>
                    <li>
                        Prices for all services, including subscription fees, are subject to change with a 30-day notice. Such changes may be announced via the OrgaGPS website (orgagps.com) or within the Service itself.
                    </li>
                    <li>OrgaGPS shall not be liable to you or any third party for any changes, price adjustments, suspensions, or discontinuations of the Service.</li>
                </ul>

                <h2>Privacy Policy</h2>
                <ul>
                    <li>OrgaGPS stores your team data as outlined in its Privacy Policy.</li>
                    <li>User data is archived regularly every 12 hours. OrgaGPS archives are retained for up to 3 months.</li>
                    <li>You can request the permanent deletion of your personal data at any time, as described in the Privacy Policy.</li>
                    <li>
                        User data is stored in the AWS region of eu-central for OrgaGPS 1 and in the AWS region of India. Data is regularly backed up and encrypted using industry-standard methods when stored or transmitted over the network. Only authorized OrgaGPS personnel have access to user data.
                    </li>
                </ul>

                <h2>General Data Protection Regulation (GDPR)</h2>
                <ul>
                    <li>If you are located in the European Union or the United Kingdom, the GDPR applies to you. Under this regulation, OrgaGPS acts as both a data controller (deciding how and why data is processed) and a data processor (processing data on behalf of the controller).</li>
                    <li>The lawful basis for collecting your data is:
                        <ul>
                            <li>Your consent during registration and acceptance of the Terms of Service.</li>
                            <li>The necessity of data processing to provide the OrgaGPS services to users.</li>
                            <li>Legitimate interests pursued by OrgaGPS Ltd.</li>
                        </ul>
                    </li>
                    <li>
                        Teame owners in the EU or UK must comply with the GDPR.
                    </li>
                </ul>

                <h2>General Conditions</h2>
                <ul>
                    <li>The Service is provided "as-is" and "as available." Use of the Service is at your own risk.</li>
                    <li>OrgaGPS uses third-party hosting providers to provide the necessary infrastructure for the Service, subject to GDPR compliance.</li>
                    <li>You may not modify, adapt, or hack the Service, or falsely imply any association with OrgaGPS or its Services.</li>
                </ul>

                <h2>Limitation of Liability</h2>
                    <p>OrgaGPS does not guarantee that:</p>
                    <ul>
                        <li>The Service will meet your specific needs.</li>
                        <li>The Service will be uninterrupted, secure, or error-free.</li>
                        <li>Results from the use of the Service will be accurate or reliable.</li>
                        <li>Any errors in the Service will be corrected.</li>
                    </ul>
            </main>
        </div>
    );
}
