const TermsAndConditions = () => {
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
            <h1 className="text-4xl font-light text-white tracking-tight mb-2">Terms and Conditions of Use</h1>
            <p className="text-violet-100 text-sm font-medium">Version: 00 00 00 00</p>
            <p className="text-violet-100 text-sm font-medium">Effective Date: Month Date, Year</p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border border-violet-100 rounded-2xl overflow-hidden">
          <div className="p-8 lg:p-12 space-y-8">
            {/* Section divider */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent flex-1"></div>
              <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent flex-1"></div>
            </div>

            {/* Terms Sections */}
            <div className="grid gap-8">
              {[
                {
                  title: "Ownership of Site; Agreement to Terms of Use",
                  content: [
                    `These Terms and Conditions of Use (the "Terms") apply to the NL Technologies Pvt.Ltd website located at http://NL Technologies Pvt.Ltdecsolutions.com, and all associated sites linked to it by NL Technologies Pvt.Ltd, its subsidiaries, and affiliates (collectively, the "Site"). The Site is the property of NL Technologies Pvt.Ltd ("NL Technologies Pvt.Ltd").`,
                    `BY USING THIS SITE, YOU AGREE TO THESE TERMS. IF YOU DO NOT AGREE, DO NOT USE THIS SITE.`,
                    `NL Technologies Pvt.Ltd reserves the right, at its sole discretion, to change, modify, add or remove any part of these Terms at any time. It is your responsibility to check these Terms periodically for changes. Your continued use of the Site following changes means you accept and agree to the changes.`,
                  ],
                },
                {
                  title: "Content",
                  content: [
                    `All content on the Site—such as text, graphics, logos, images, audio, video, software code, layout and design—is the property of NL Technologies Pvt.Ltd or its licensors and is protected by copyright, trademark, and other intellectual property laws.`,
                    `You may not reproduce, republish, distribute, display, transmit, or otherwise use any Content without prior written permission from NL Technologies Pvt.Ltd, except for personal, non-commercial use.`,
                  ],
                },
                {
                  title: "Use of Site",
                  content: [
                    `You agree to use this Site only for lawful purposes and in accordance with these Terms. You may not:`,
                  ],
                  list: [
                    "Attempt unauthorized access to any part of the Site, server, or network.",
                    "Use any automated system (bots, scrapers, etc.) to access the Site.",
                    "Interfere with the functioning of the Site or any activities conducted on it.",
                    "Impersonate any person or misrepresent your identity.",
                  ],
                  note: `NL Technologies Pvt.Ltd reserves the right to block access to the Site for any user suspected of violating these Terms.`,
                },
                {
                  title: "Accounts and Security",
                  content: [
                    `Some services on the Site may require account creation. You are responsible for maintaining the confidentiality of your account credentials. You agree to notify NL Technologies Pvt.Ltd immediately of any unauthorized use of your account.`,
                    `NL Technologies Pvt.Ltd is not liable for any loss or damage resulting from your failure to protect your account information.`,
                  ],
                },
                {
                  title: "Privacy",
                  content: [
                    `Your use of the Site is also governed by our Privacy Policy, which is incorporated into these Terms by reference.`,
                  ],
                },
                {
                  title: "Third-Party Links",
                  content: [
                    `This Site may contain links to external websites ("Linked Sites"). NL Technologies Pvt.Ltd has no control over Linked Sites and is not responsible for their content, practices, or availability. Access these links at your own risk.`,
                  ],
                },
                {
                  title: "Disclaimers",
                  content: [
                    `NL Technologies Pvt.Ltd DOES NOT GUARANTEE THAT THE SITE OR ITS CONTENT WILL BE ERROR-FREE OR UNINTERRUPTED. THE SITE IS PROVIDED "AS IS" AND "AS AVAILABLE." NL Technologies Pvt.Ltd DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
                    `You assume full responsibility for your use of the Site and any Linked Sites.`,
                  ],
                },
                {
                  title: "Limitation of Liability",
                  content: [
                    `To the maximum extent allowed by law, NL Technologies Pvt.Ltd shall not be liable for any direct, indirect, incidental, special or consequential damages resulting from your use of the Site or reliance on any information presented.`,
                  ],
                },
                {
                  title: "Indemnification",
                  content: [
                    `You agree to indemnify and hold harmless NL Technologies Pvt.Ltd, its employees, directors, agents, and affiliates from any claims or liabilities arising from your use of the Site or your violation of these Terms.`,
                  ],
                },
                {
                  title: "Termination",
                  content: [
                    `NL Technologies Pvt.Ltd may, at its discretion and without notice, suspend or terminate your access to the Site if you violate these Terms or engage in conduct that NL Technologies Pvt.Ltd deems harmful.`,
                  ],
                },
                {
                  title: "Governing Law and Jurisdiction",
                  content: [
                    `These Terms are governed by the laws of India. You agree to submit to the exclusive jurisdiction of the courts located in [Your City, State] for resolution of any disputes.`,
                  ],
                },
                {
                  title: "International Use",
                  content: [
                    `NL Technologies Pvt.Ltd makes no representation that the Site or its content is appropriate or available for use outside of India. Access from countries where content is illegal is prohibited.`,
                  ],
                },
                {
                  title: "Miscellaneous",
                  content: [
                    `If any provision of these Terms is found unenforceable, that provision will be modified to reflect the intent of the parties, and the rest of the Terms will remain in full effect.`,
                    `These Terms constitute the entire agreement between you and NL Technologies Pvt.Ltd regarding your use of the Site and supersede any prior agreements.`,
                  ],
                },
                {
                  title: "Feedback and Contact",
                  content: [
                    `Any feedback submitted via this Site shall be deemed non-confidential. NL Technologies Pvt.Ltd is free to use such information without restriction.`,
                    `If you have any questions about these Terms, please contact:`,
                    `NL Technologies Pvt.Ltd`,
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
                          {section.title}
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
                  These terms and conditions are effective as of the date stated above and apply to all users of our services.
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

export default TermsAndConditions;