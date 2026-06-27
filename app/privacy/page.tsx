import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#fcfdff]">
      <nav className="flex items-center justify-between px-8 h-16 border-b border-[rgba(255,255,255,0.06)]">
        <Link href="/" className="text-lg font-semibold tracking-tight">LocalBrain</Link>
        <Link href="/" className="text-sm text-[#a1a4a5] hover:text-[#fcfdff] transition-colors">Back to Home</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-[#a1a4a5] mb-8">Last updated: June 27, 2026</p>

        <div className="space-y-8 text-[rgba(252,253,255,0.86)] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p>Welcome to LocalBrain (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our application.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-medium mb-2 mt-4">Account Information</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Email address (for authentication)</li>
              <li>Name (if provided via Google OAuth)</li>
              <li>Password (encrypted, stored by Supabase)</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-4">Content You Create</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Notes and documents you write or upload</li>
              <li>PDF files you import</li>
              <li>Knowledge graph data you create</li>
              <li>Chat conversations with AI</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-4">Technical Data</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Usage analytics (page views, feature usage)</li>
              <li>Device information (browser, operating system)</li>
              <li>IP address (for security and abuse prevention)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>To provide and maintain our service</li>
              <li>To authenticate your account</li>
              <li>To process your notes and generate AI responses</li>
              <li>To improve our application</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
            <p>Your data is stored securely in Supabase (PostgreSQL database) with row-level security enabled. Your API keys are encrypted with AES-256 before storage. We implement industry-standard security measures including:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Encrypted data at rest and in transit</li>
              <li>Row-level security policies</li>
              <li>Regular security audits</li>
              <li>Secure authentication via Supabase Auth</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li><strong>Supabase</strong> - Database and authentication</li>
              <li><strong>Vercel</strong> - Hosting and deployment</li>
              <li><strong>LLM Providers</strong> - AI processing (you provide your own API keys)</li>
              <li><strong>Google OAuth</strong> - Optional authentication</li>
            </ul>
            <p className="mt-2">Each third-party service has its own privacy policy governing the use of your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. API Keys</h2>
            <p>If you choose to configure LLM providers, you provide your own API keys. These keys are encrypted and stored securely. We do not share your API keys with any third parties. You can delete your API keys at any time from the Settings page.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. You can delete your notes, knowledge graph, and other data at any time. Account deletion will remove all associated data within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
            <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated &quot;Last updated&quot; date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p>If you have any questions about this privacy policy, please contact us at:</p>
            <p className="mt-2">Email: privacy@localbrain.in</p>
          </section>
        </div>
      </main>
    </div>
  )
}
