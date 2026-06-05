const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border border-violet-100 rounded-2xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-gray-700 p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-white/30 rounded-full"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
            </div>
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-violet-100 text-sm font-medium">Last Updated: Month Date, Year</p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border border-violet-100 rounded-2xl overflow-hidden">
          <div className="p-8 lg:p-12 space-y-8">
            {/* Introduction with accent */}
            <section className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-violet-500 to-gray-500 rounded-full"></div>
              <div className="pl-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  NL Technologies Pvt.Ltd ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website at http://nltecsolutions.com/ (the "Site").
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We are committed to protecting your data and being transparent about what we collect and how we use it.
                </p>
              </div>
            </section>

            {/* Section divider */}
            <div className="flex items-center space-x-4 my-8">
              <div className="h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent flex-1"></div>
              <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent flex-1"></div>
            </div>

            {/* Policy Sections */}
            <div className="grid gap-8">
              {[
                {
                  title: "1. What Information We Collect",
                  content: [
                    "We may collect the following types of personal data:",
                  ],
                  list: [
                    "Contact Information: such as your name, email address, phone number, and company name when you contact us via forms or email.",
                    "Technical Data: such as your IP address, browser type, device information, referring URLs, and usage patterns through cookies or analytics tools.",
                    "Optional Submissions: if you sign up for newsletters, request demos, or apply for jobs, we may collect additional information such as preferences, resumes, etc.",
                  ],
                },
                {
                  title: "2. How We Use Your Information",
                  content: [
                    "We may use your information to:",
                  ],
                  list: [
                    "Respond to inquiries and provide customer support.",
                    "Improve and optimize our website.",
                    "Monitor site performance and troubleshoot errors.",
                    "Send you updates, news, or promotional content (only with your consent).",
                    "Maintain security and prevent misuse or fraud.",
                  ],
                },
                {
                  title: "3. Sharing of Information",
                  content: [
                    "We do not sell your personal data.",
                    "We may share your information only with:",
                  ],
                  list: [
                    "Service providers who support our operations (such as hosting or analytics).",
                    "Legal authorities if required by law, court order, or to enforce our Terms of Use.",
                    "Partners or subsidiaries, where necessary for business functionality.",
                  ],
                  note: "All third parties are obligated to handle your data securely and in accordance with this policy.",
                },
                {
                  title: "4. Your Rights and Choices",
                  content: [
                    "Depending on your location, you may have the right to:",
                  ],
                  list: [
                    "Access or request a copy of the personal data we hold.",
                    "Request correction or deletion of your data.",
                    "Object to or restrict certain uses of your data.",
                    "Withdraw consent, if processing was based on consent.",
                  ],
                  note: "To exercise your rights, please contact us using the details below.",
                },
                {
                  title: "5. Cookies and Tracking Technologies",
                  content: [
                    "We use cookies and similar technologies to enhance user experience, track website usage, and gather analytics.",
                    "You can control cookies via your browser settings.",
                  ],
                },
                {
                  title: "6. Data Security",
                  content: [
                    "We use reasonable physical, electronic, and administrative safeguards to protect your personal data. However, no method of transmission over the Internet is 100% secure.",
                  ],
                },
                {
                  title: "7. Data Retention",
                  content: [
                    "We retain your information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy unless a longer retention period is required by law.",
                  ],
                },
                {
                  title: "8. Children's Privacy",
                  content: [
                    "Our website is not intended for use by children under the age of 13. We do not knowingly collect personal data from children.",
                  ],
                },
                {
                  title: "9. Third-Party Links",
                  content: [
                    "Our Site may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. Please read their privacy policies separately.",
                  ],
                },
                {
                  title: "10. International Users",
                  content: [
                    "If you access the Site from outside India, you do so on your own initiative and are responsible for compliance with local laws. Your information may be stored and processed in India or other countries where we or our service providers operate.",
                  ],
                },
                {
                  title: "11. Updates to This Privacy Policy",
                  content: [
                    "We may update this Privacy Policy from time to time. The latest version will always be posted on this page with the updated date. We encourage you to review it periodically.",
                  ],
                },
                {
                  title: "12. Contact Us",
                  content: [
                    "If you have any questions, concerns, or requests related to this Privacy Policy, please contact:",
                    "NL Technologies Pvt.Ltd",
                  ],
                },
              ].map((section, i) => (
                <div key={i} className="group">
                  <div className="bg-gradient-to-r from-violet-50 to-gray-50 border border-violet-100 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                    {/* Section number indicator */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-violet-700 transition-colors">
                          {section.title.replace(/^\d+\.\s*/, '')}
                        </h2>
                        
                        <div className="space-y-4">
                          {section.content.map((para, j) => (
                            <p key={j} className="text-gray-700 leading-relaxed">{para}</p>
                          ))}
                          
                          {section.list && (
                            <div className="bg-white/60 rounded-lg p-4 border border-violet-100">
                              <ul className="space-y-3">
                                {section.list.map((item, k) => (
                                  <li key={k} className="text-gray-700 leading-relaxed flex items-start">
                                    <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {section.note && (
                            <div className="bg-gradient-to-r from-violet-50 to-gray-50 border-l-4 border-violet-400 pl-4 py-3 rounded-r-lg">
                              <div className="flex items-start space-x-2">
                                <div className="w-4 h-4 bg-violet-400 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed italic">{section.note}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="relative mt-12">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-100 via-gray-100 to-violet-100 rounded-xl opacity-50"></div>
              <div className="relative bg-white/80 border border-violet-200 rounded-xl p-6 text-center">
                <div className="flex justify-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-600">
                  This privacy policy is effective as of the date stated above and applies to all users of our services.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  © NL Technologies Pvt.Ltd - All rights reserved
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;