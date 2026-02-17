import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
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
              These Terms of Service ("Terms") govern your access to and use of Propequitylab's website, software,
              and services (collectively, the "Service"). By accessing or using the Service, you agree to be
              bound by these Terms. If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Service Description</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Propequitylab provides a property portfolio tracking and financial planning platform that allows you to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Track multiple property portfolios and calculate net worth</li>
              <li>Monitor income, expenses, assets, and liabilities</li>
              <li>Visualize cash flow and financial projections</li>
              <li>Plan your path to financial independence (FIRE)</li>
            </ul>
            <p className="text-gray-700 mt-4 leading-relaxed">
              The Service is provided on a subscription basis with different tiers and features.
            </p>
          </section>

          {/* Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Registration</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              To use the Service, you must create an account by providing accurate and complete information.
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Ensuring your email address is current and valid</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Eligibility</h3>
            <p className="text-gray-700 leading-relaxed">
              You must be at least 18 years old to create an account. By creating an account, you represent
              that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Acceptable Use Policy</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) to access the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Share your account with others or create multiple accounts</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Violate the intellectual property rights of Propequitylab or others</li>
            </ul>
          </section>

          {/* User Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Your Data</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>Data Ownership:</strong> You retain all rights to the data you input into the Service.
              By using the Service, you grant Propequitylab a license to use, store, and process your data solely
              for the purpose of providing the Service.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>Data Accuracy:</strong> You are responsible for the accuracy and completeness of the
              data you provide. Propequitylab is not liable for any decisions made based on inaccurate data.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Data Backup:</strong> While we implement backup procedures, you are responsible for
              maintaining your own backup copies of important data. We recommend regularly exporting your data.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The Service, including all content, features, and functionality, is owned by Propequitylab and is
              protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You are granted a limited, non-exclusive, non-transferable license to access and use the Service
              for your personal or business use in accordance with these Terms. This license does not include
              the right to resell or commercially exploit the Service.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Important Disclaimers</h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Financial Advice</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Propequitylab is a financial tracking and planning tool, NOT a financial advisor.</strong> The
                Service provides calculations, projections, and visualizations based on data you provide, but
                does not constitute financial, investment, tax, or legal advice.
              </p>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              You should:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Consult with qualified financial advisors before making investment decisions</li>
              <li>Verify all calculations and projections independently</li>
              <li>Not rely solely on the Service for financial planning</li>
              <li>Understand that past performance does not guarantee future results</li>
            </ul>

            <p className="text-gray-700 leading-relaxed">
              Propequitylab is not responsible for any financial losses, investment decisions, or tax implications
              resulting from your use of the Service.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>As-Is Basis:</strong> The Service is provided "as is" and "as available" without warranties
              of any kind, either express or implied.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We strive for high availability but do not guarantee:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Uninterrupted or error-free operation</li>
              <li>That the Service will meet your specific requirements</li>
              <li>That data will be accurate, complete, or current</li>
              <li>That defects will be corrected immediately</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any part of the Service with or without
              notice for maintenance, updates, or other reasons.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              To the maximum extent permitted by law, Propequitylab and its affiliates, directors, employees, and
              agents shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Any damages resulting from use or inability to use the Service</li>
              <li>Errors, mistakes, or inaccuracies in content or data</li>
              <li>Unauthorized access to your account or data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Our total liability for any claim arising from these Terms or the Service shall not exceed the
              amount you paid for the Service in the 12 months preceding the claim.
            </p>
          </section>

          {/* Payments and Subscriptions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Payments and Subscriptions</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>Subscription Plans:</strong> Access to certain features requires a paid subscription.
              Subscription fees are billed in advance on a recurring basis (monthly or annually).
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>Automatic Renewal:</strong> Subscriptions automatically renew unless cancelled before
              the renewal date. You can cancel at any time from your account settings.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>Refunds:</strong> Refunds are provided at our discretion. We do not provide refunds for
              partial billing periods.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Price Changes:</strong> We reserve the right to change subscription prices with 30 days'
              notice. Price changes will apply to subsequent billing periods.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>By You:</strong> You may terminate your account at any time from your account settings.
              Upon termination, your access to the Service will end immediately.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>By Us:</strong> We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Violate these Terms or our Acceptable Use Policy</li>
              <li>Fail to pay subscription fees</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Have not used your account for an extended period</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              <strong>Effect of Termination:</strong> Upon termination, your right to access the Service ceases
              immediately. We will delete your data according to our Privacy Policy (30-day retention period).
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to These Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms at any time. We will notify you of material changes via email or through
              the Service. Your continued use of the Service after changes become effective constitutes acceptance
              of the modified Terms. If you do not agree to the changes, you must stop using the Service.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law and Disputes</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              These Terms are governed by the laws of Australia. Any disputes arising from these Terms or the
              Service shall be resolved through binding arbitration in accordance with Australian commercial
              arbitration rules.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You agree to waive your right to participate in class action lawsuits or class-wide arbitration.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:legal@propequitylab.com.au" className="text-lime-600 hover:text-lime-700">legal@propequitylab.com.au</a></p>
              <p className="text-gray-700 mt-2"><strong>Support:</strong> <a href="mailto:support@propequitylab.com.au" className="text-lime-600 hover:text-lime-700">support@propequitylab.com.au</a></p>
            </div>
          </section>

          {/* Severability */}
          <section className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable or
              invalid, that provision will be limited or eliminated to the minimum extent necessary, and the
              remaining provisions will remain in full force and effect.
            </p>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the
              entire agreement between you and Propequitylab regarding the Service and supersede any prior agreements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
