import Link from 'next/link'

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#fcfdff]">
      <nav className="flex items-center justify-between px-8 h-16 border-b border-[rgba(255,255,255,0.06)]">
        <Link href="/" className="text-lg font-semibold tracking-tight">LocalBrain</Link>
        <Link href="/" className="text-sm text-[#a1a4a5] hover:text-[#fcfdff] transition-colors">Back to Home</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
        <p className="text-sm text-[#a1a4a5] mb-8">Last updated: June 27, 2026</p>

        <div className="space-y-8 text-[rgba(252,253,255,0.86)] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using LocalBrain (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p>LocalBrain is an AI-powered knowledge management application that allows users to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Create, edit, and organize notes</li>
              <li>Build knowledge graphs from their notes</li>
              <li>Chat with AI about their content using RAG (Retrieval-Augmented Generation)</li>
              <li>Use various AI tools for studying and productivity</li>
              <li>Import content from PDFs and URLs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You must be at least 13 years old to create an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must not share your account credentials</li>
              <li>You must notify us immediately of any unauthorized use</li>
              <li>One person may not maintain more than one free account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Your Content</h2>
            <h3 className="text-lg font-medium mb-2 mt-4">Ownership</h3>
            <p>You retain all rights to the content you create and upload to LocalBrain. We do not claim ownership of your notes, knowledge graphs, or other content.</p>

            <h3 className="text-lg font-medium mb-2 mt-4">License to Use</h3>
            <p>By using LocalBrain, you grant us a limited license to process your content solely for the purpose of providing the Service (e.g., generating embeddings, AI responses, and knowledge graph connections).</p>

            <h3 className="text-lg font-medium mb-2 mt-4">Content Responsibility</h3>
            <p>You are solely responsible for the content you create and share. You must not upload content that:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Violates any law or regulation</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware or harmful code</li>
              <li>Is defamatory, obscene, or harassing</li>
              <li>Promotes violence or illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. AI-Generated Content</h2>
            <p>The Service uses AI to generate content, including summaries, flashcards, quizzes, and other outputs. You acknowledge that:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>You should verify AI outputs before relying on them</li>
              <li>AI is not a substitute for professional advice</li>
              <li>We are not responsible for decisions made based on AI-generated content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. API Keys and Third-Party Services</h2>
            <p>If you use your own API keys with LLM providers:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>You are responsible for your API key security</li>
              <li>You are subject to the terms of service of each provider</li>
              <li>We are not responsible for API usage charges from providers</li>
              <li>We do not access or store your API keys in plain text</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated means to access the Service without permission</li>
              <li>Resell or redistribute the Service</li>
              <li>Use the Service to compete with us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
            <p>IN NO EVENT SHALL LOCALBRAIN, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Indemnification</h2>
            <p>You agree to indemnify and hold harmless LocalBrain from any claims, losses, or damages arising from your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
            <p>We may terminate or suspend your account at any time for conduct that violates these Terms or is harmful to other users, us, or third parties, or for any other reason.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page with an updated &quot;Last updated&quot; date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p className="mt-2">Email: legal@localbrain.in</p>
          </section>
        </div>
      </main>
    </div>
  )
}
