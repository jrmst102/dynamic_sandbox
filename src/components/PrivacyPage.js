import React from 'react';
import { ContentPage } from './HelpPage';
import { colors } from '../styles';

export default function PrivacyPage({ onBack }) {
  return (
    <ContentPage title="Privacy Policy" onBack={onBack}>
      <p style={meta}>Dynamic Pricing Sandbox — Last Updated: March 2026</p>

      {/* MVP notice per spec §4.3 */}
      <div style={notice}>
        <strong>Note:</strong> The current version of the Dynamic Pricing Sandbox does not require
        an account and does not collect personal information. This Privacy Policy describes the data
        practices that will apply when user accounts are introduced in a future release.
      </div>

      <H2>1. Data Controller</H2>
      <p style={body}>
        The data controller for the Dynamic Pricing Sandbox is Dr. Jose Mendoza. For questions about
        this policy or your personal data, contact:
      </p>
      <p style={body}>
        <strong>Dr. Jose Mendoza</strong><br />
        Email: jose.mendoza@nyu.edu
      </p>

      <H2>2. Information Collected</H2>
      <p style={body}>
        When user accounts are available, the Application may collect the following information:
      </p>
      <ul style={list}>
        <li>Username, first name, last name, and email address</li>
        <li>University or organization affiliation</li>
        <li>A cryptographically hashed version of your password (never stored in plaintext)</li>
        <li>Login and logout timestamps, IP addresses, and browser user-agent strings</li>
        <li>Session identifiers for maintaining authenticated sessions</li>
      </ul>

      <H2>3. Purpose of Collection</H2>
      <p style={body}>
        Information is collected for creating and managing user accounts, authenticating identity,
        maintaining application security, generating audit logs for administrative oversight, and
        communicating regarding account status.
      </p>

      <H2>4. Data Storage &amp; Security</H2>
      <p style={body}>
        Data will be stored on managed database infrastructure with encrypted connections (SSL).
        Passwords are hashed using bcrypt and are never stored or transmitted in plaintext.
      </p>

      <H2>5. Data Retention &amp; Deletion</H2>
      <p style={body}>
        Account information is retained for the duration of the account's existence. If an account
        is permanently deleted, personal information will be removed; however, audit log entries may
        be retained in a de-identified form for security purposes.
      </p>

      <H2>6. Third-Party Disclosure</H2>
      <p style={body}>
        Personal information is not sold, rented, or shared with third parties for marketing purposes.
        Information may be disclosed if required by law, regulation, or legal process.
      </p>

      <H2>7. Your Rights</H2>
      <p style={body}>
        You have the right to access, correct, or request deletion of your personal information.
        To exercise these rights, contact the data controller at the email address above.
      </p>

      <H2>8. Children's Privacy</H2>
      <p style={body}>
        The Application is intended for users aged 13 and older. Users under 18 must have the consent
        of a parent, guardian, or authorized educational institution representative. The Application
        does not knowingly collect personal information from children under 13.
      </p>
    </ContentPage>
  );
}

function H2({ children }) {
  return (
    <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginTop: 24, marginBottom: 8 }}>
      {children}
    </h3>
  );
}

const body = { fontSize: 14, lineHeight: 1.7, color: colors.text, marginBottom: 12 };
const meta = { fontSize: 12, color: colors.textSecondary, marginBottom: 20, fontStyle: 'italic' };
const list = { paddingLeft: 20, fontSize: 14, lineHeight: 1.8, color: colors.text, marginBottom: 12 };
const notice = {
  background: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: 10,
  padding: '14px 18px',
  fontSize: 13,
  lineHeight: 1.6,
  color: '#92400e',
  marginBottom: 24,
};
