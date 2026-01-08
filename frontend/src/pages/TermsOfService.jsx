import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Last updated: January 9, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 prose prose-gray dark:prose-invert max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Propequitylab. By accessing or using our property investment portfolio management platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms constitute a legally binding agreement between you and Propequitylab ("we," "us," or "our"). We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Propequitylab provides a web-based platform for managing property investment portfolios, tracking financial data, and planning for financial independence and retirement. Our Service includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Property portfolio management and tracking</li>
              <li>Income and expense tracking</li>
              <li>Asset and liability management</li>
              <li>Financial projections and FIRE (Financial Independence, Retire Early) planning</li>
              <li>Net worth tracking and visualization</li>
              <li>Financial calculators and tools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts and Registration</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To use our Service, you must create an account by providing accurate, current, and complete information. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Provide truthful and accurate registration information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.2 Account Eligibility</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You must be at least 18 years old to use our Service. By creating an account, you represent and warrant that you meet this age requirement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.3 Account Responsibility</h3>
            <p className="text-gray-700 dark:text-gray-300">
              You are responsible for all activities that occur under your account. You agree to notify us immediately of any security breach or unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to any part of the Service or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
              <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
              <li>Upload or transmit viruses, malware, or any malicious code</li>
              <li>Impersonate another person or entity</li>
              <li>Collect or harvest personal information of other users</li>
              <li>Use the Service for any commercial purpose without our written consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. User Content and Data</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.1 Your Data</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You retain all rights to the financial data and information you input into the Service ("User Content"). By using the Service, you grant us a limited license to use, store, and process your User Content solely for the purpose of providing the Service to you.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.2 Data Accuracy</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You are responsible for the accuracy and completeness of the data you enter. We do not verify the accuracy of User Content and are not responsible for any decisions you make based on data in the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.3 Data Backup</h3>
            <p className="text-gray-700 dark:text-gray-300">
              While we implement backup procedures, you are responsible for maintaining your own backup copies of important data. We are not liable for any loss of User Content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.1 Our Property</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Service, including its design, features, functionality, and all content (excluding User Content), is owned by Propequitylab and is protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.2 Limited License</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We grant you a limited, non-exclusive, non-transferable license to access and use the Service for your personal, non-commercial use, subject to these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Disclaimers and Limitations</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7.1 No Financial Advice</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-gray-900 dark:text-gray-100 font-semibold mb-2">IMPORTANT DISCLAIMER:</p>
              <p className="text-gray-700 dark:text-gray-300">
                Propequitylab is a portfolio management tool and does NOT provide financial, investment, tax, or legal advice. The Service is for informational and organizational purposes only. You should consult with qualified professionals before making any financial decisions.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7.2 No Guarantees</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not guarantee:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>The accuracy, completeness, or reliability of any calculations or projections</li>
              <li>That the Service will meet your specific requirements</li>
              <li>That the Service will be uninterrupted, timely, secure, or error-free</li>
              <li>Any particular financial outcome or result</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7.3 "AS IS" Service</h3>
            <p className="text-gray-700 dark:text-gray-300">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROPEQUITYLAB SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Financial losses resulting from your use of or reliance on the Service</li>
              <li>Any damages arising from unauthorized access to your account</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Our total liability to you for any claims arising from your use of the Service shall not exceed the amount you paid us (if any) in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Indemnification</h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify, defend, and hold harmless Propequitylab and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your User Content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Termination</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10.1 Termination by You</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination, your User Content will be deleted within 30 days.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10.2 Termination by Us</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to suspend or terminate your account and access to the Service at any time, with or without notice, for:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>Any reason at our sole discretion</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10.3 Effect of Termination</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your use of the Service is also governed by our <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our data practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Changes to the Service</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update these Terms from time to time. We will notify you of significant changes by email or through a prominent notice on the Service. Your continued use of the Service after changes are posted constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">14. Governing Law and Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.1 Governing Law</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of Australia, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.2 Dispute Resolution</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Any disputes arising from these Terms or your use of the Service shall be resolved through good faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration or in the courts of Australia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">15. Miscellaneous</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">15.1 Entire Agreement</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Propequitylab regarding the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">15.2 Severability</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">15.3 Waiver</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">15.4 Assignment</h3>
            <p className="text-gray-700 dark:text-gray-300">
              You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">16. Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Email:</strong> <a href="mailto:legal@propequitylab.com" className="text-blue-600 dark:text-blue-400 hover:underline">legal@propequitylab.com</a>
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
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              By using Propequitylab, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              © 2026 Propequitylab. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
