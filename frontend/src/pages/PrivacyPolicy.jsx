import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Last updated: January 9, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 prose prose-gray dark:prose-invert max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Propequitylab ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our property investment portfolio management platform.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By using Propequitylab, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We collect personal information that you voluntarily provide to us when you register on the platform, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Name and email address</li>
              <li>Account credentials (encrypted password)</li>
              <li>Profile information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.2 Financial Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To provide our portfolio management services, we collect financial information you choose to enter, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Property details (addresses, purchase prices, valuations)</li>
              <li>Income sources and amounts</li>
              <li>Expenses and spending patterns</li>
              <li>Assets and liabilities</li>
              <li>Investment goals and retirement plans</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.3 Usage Data</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We automatically collect certain information when you use our platform:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Device information</li>
              <li>Usage patterns and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Provide Services:</strong> To create and manage your account, process your data, and provide portfolio management features</li>
              <li><strong>Improve Platform:</strong> To understand how users interact with our platform and improve functionality</li>
              <li><strong>Communication:</strong> To send you service-related emails (verification, password resets, important updates)</li>
              <li><strong>Security:</strong> To protect against unauthorized access and ensure data security</li>
              <li><strong>Compliance:</strong> To comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/TLS) and at rest</li>
              <li><strong>Authentication:</strong> Secure JWT-based authentication with bcrypt password hashing</li>
              <li><strong>Data Isolation:</strong> Strict data isolation ensures users can only access their own data</li>
              <li><strong>Rate Limiting:</strong> Protection against brute force attacks and abuse</li>
              <li><strong>Regular Security Audits:</strong> Ongoing security assessments and updates</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform (e.g., hosting, email services) under strict confidentiality agreements</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (users will be notified)</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Your Privacy Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Opt-out of non-essential communications</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              To exercise these rights, please contact us at <a href="mailto:privacy@propequitylab.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@propequitylab.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use essential cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Maintain your login session</li>
              <li>Remember your preferences (e.g., dark mode)</li>
              <li>Analyze platform usage (privacy-friendly analytics)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              You can control cookies through your browser settings, but disabling essential cookies may affect platform functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our platform uses the following third-party services:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>AWS App Runner:</strong> Hosting infrastructure (AWS Privacy Policy applies)</li>
              <li><strong>Neon PostgreSQL:</strong> Database hosting (Neon Privacy Policy applies)</li>
              <li><strong>Cloudflare Pages:</strong> Frontend hosting (Cloudflare Privacy Policy applies)</li>
              <li><strong>Resend:</strong> Email delivery service (Resend Privacy Policy applies)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Propequitylab is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. Your continued use of Propequitylab after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Email:</strong> <a href="mailto:privacy@propequitylab.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@propequitylab.com</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Support:</strong> <a href="mailto:support@propequitylab.com" className="text-blue-600 dark:text-blue-400 hover:underline">support@propequitylab.com</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Website:</strong> <a href="https://propequitylab.pages.dev" className="text-blue-600 dark:text-blue-400 hover:underline">https://propequitylab.pages.dev</a>
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              © 2026 Propequitylab. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
