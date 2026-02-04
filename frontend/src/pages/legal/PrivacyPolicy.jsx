import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: January 18, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Zapiio. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data when you visit
              our website and use our services, and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data We Collect</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              When you register for Zapiio, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Name and email address</li>
              <li>Country and state/region</li>
              <li>Planning type (individual, couple, family)</li>
              <li>Currency preference</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Financial Data</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              To provide our portfolio tracking services, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Property information (addresses, values, purchase dates)</li>
              <li>Asset and liability details</li>
              <li>Income and expense information</li>
              <li>Financial goals and retirement plans</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Data</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We automatically collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>IP address and browser type</li>
              <li>Pages visited and time spent on pages</li>
              <li>Device information</li>
              <li>Login times and authentication events</li>
            </ul>
          </section>

          {/* How We Use Your Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Data</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To provide and maintain our portfolio tracking services</li>
              <li>To calculate net worth, cash flow, and financial projections</li>
              <li>To send important account notifications and service updates</li>
              <li>To improve our services and develop new features</li>
              <li>To ensure security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>Security Measures:</strong> We implement industry-standard security measures to protect
              your data, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Encryption of data in transit (TLS/SSL)</li>
              <li>Encrypted storage of sensitive information</li>
              <li>Secure authentication with JWT tokens</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              <strong>Data Location:</strong> Your data is stored on secure cloud servers located in Australia.
              We use PostgreSQL databases with automated backups and redundancy.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>We do not sell your personal data.</strong> We may share your information only in these circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Service Providers:</strong> We work with trusted third-party service providers
                (email delivery, error monitoring) who process data on our behalf under strict confidentiality agreements</li>
              <li><strong>Legal Requirements:</strong> We may disclose data if required by law, court order,
                or government regulation</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets,
                your data may be transferred (you will be notified)</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Under GDPR and Australian Privacy Principles, you have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to certain types of processing</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>
            <p className="text-gray-700 mt-4 leading-relaxed">
              To exercise these rights, visit your <Link to="/settings" className="text-lime-600 hover:text-lime-700 font-semibold">Settings</Link> page
              or contact us at <a href="mailto:privacy@zapiio.com" className="text-lime-600 hover:text-lime-700">privacy@zapiio.com</a>.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We use essential cookies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Keep you logged in securely</li>
              <li>Remember your preferences</li>
              <li>Analyze how our service is used (anonymized data)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We only use essential cookies required for the service to function. You can control cookie
              settings in your browser, but disabling cookies may affect functionality.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data for as long as your account is active. If you delete your account,
              we will:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2 ml-4">
              <li>Immediately anonymize your personal information</li>
              <li>Retain anonymized data for 30 days (to allow account recovery if needed)</li>
              <li>Permanently delete all data after 30 days</li>
              <li>Retain minimal data if required by law (e.g., financial records for tax purposes)</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Zapiio is not intended for use by individuals under the age of 18. We do not knowingly collect
              personal information from children. If you become aware that a child has provided us with personal
              data, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any material changes
              by posting the new policy on this page and updating the "Last updated" date. We encourage you to
              review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              If you have any questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:privacy@zapiio.com" className="text-lime-600 hover:text-lime-700">privacy@zapiio.com</a></p>
              <p className="text-gray-700 mt-2"><strong>Data Protection Officer:</strong> <a href="mailto:dpo@zapiio.com" className="text-lime-600 hover:text-lime-700">dpo@zapiio.com</a></p>
            </div>
          </section>

          {/* Jurisdiction */}
          <section className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              This privacy policy is governed by the laws of Australia. For users in the European Union,
              this policy complies with GDPR requirements. For Australian users, this policy complies with
              the Privacy Act 1988 and Australian Privacy Principles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
