const VersionInformation = () => {
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
            <h1 className="text-4xl font-light text-white tracking-tight mb-4">Version Information</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-violet-200 text-xs uppercase tracking-wide">Current Version</p>
                <p className="text-white text-lg font-semibold">00.00.00.00</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-violet-200 text-xs uppercase tracking-wide">Release Date</p>
                <p className="text-white text-lg font-semibold">UnKnown</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-violet-200 text-xs uppercase tracking-wide">Last Updated</p>
                <p className="text-white text-lg font-semibold">UnKnown</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border border-violet-100 rounded-2xl overflow-hidden">
          <div className="p-8 lg:p-12 space-y-8">
            {/* Current Version Details */}
            <section className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-violet-500 to-gray-500 rounded-full"></div>
              <div className="pl-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Release Overview</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Version 00.00.00.00 represents the initial stable release of NL Technologies Pvt.Ltd software platform. This release includes core functionality, security implementations, and foundational features designed for optimal user experience.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our versioning system follows a structured format: Major.Minor.Patch.Build-Stage, ensuring clear identification of each software iteration and its development stage.
                </p>
              </div>
            </section>

            {/* Section divider */}
            <div className="flex items-center space-x-4 my-8">
              <div className="h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent flex-1"></div>
              <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent flex-1"></div>
            </div>

            {/* Version Details Sections */}
            <div className="grid gap-8">
              {/* Version Numbering System */}
              <div className="group">
                <div className="bg-gradient-to-r from-violet-50 to-gray-50 border border-violet-100 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">#</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-violet-700 transition-colors">
                        Version Numbering System
                      </h2>
                      
                      <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                          Our software uses a semantic versioning system to clearly communicate the nature and scope of changes in each release:
                        </p>
                        
                        <div className="bg-white/60 rounded-lg p-4 border border-violet-100">
                          <ul className="space-y-3">
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span><strong>Major (01):</strong> Significant feature additions or architectural changes</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span><strong>Minor (02):</strong> New features and enhancements, backward compatible</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span><strong>Patch (00):</strong> Bug fixes and minor improvements</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span><strong>Build (00):</strong> Internal build number for development tracking</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span><strong>Stage (B):</strong> Release stage - A (Alpha), B (Beta), RC (Release Candidate), S (Stable)</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Release Notes */}
              <div className="group">
                <div className="bg-gradient-to-r from-violet-50 to-gray-50 border border-violet-100 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">📋</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-violet-700 transition-colors">
                        Release Notes - Version 01.02.00.00-B
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="bg-white/60 rounded-lg p-4 border border-violet-100">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">What's New:</h3>
                          <ul className="space-y-3">
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span>Initial software platform release with core functionality</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span>Comprehensive user interface design implementation</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span>Security protocols and data protection measures</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span>Legal documentation and compliance framework</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Version History */}
              <div className="group">
                <div className="bg-gradient-to-r from-violet-50 to-gray-50 border border-violet-100 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">📚</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-violet-700 transition-colors">
                        Version History & Timeline
                      </h2>
                      
                      <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                          Track the evolution of our software through its development lifecycle:
                        </p>
                        
                        <div className="bg-white/60 rounded-lg p-4 border border-violet-100">
                          <div className="space-y-4">
                            <div className="border-l-4 border-violet-400 pl-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Version 01.02.00.00-B</h4>
                                  <p className="text-sm text-gray-600">Current Release</p>
                                </div>
                                <span className="text-sm text-gray-500">July 25, 2025</span>
                              </div>
                              <p className="text-gray-700 text-sm mt-2">Initial beta release with core platform features and security implementation.</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-violet-50 to-gray-50 border-l-4 border-violet-400 pl-4 py-3 rounded-r-lg">
                          <div className="flex items-start space-x-2">
                            <div className="w-4 h-4 bg-violet-400 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              Future versions will be documented here as they are released, providing a complete development timeline.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support & Compatibility */}
              <div className="group">
                <div className="bg-gradient-to-r from-violet-50 to-gray-50 border border-violet-100 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">🔧</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-violet-700 transition-colors">
                        Support & Compatibility Information
                      </h2>
                      
                      <div className="space-y-4">
                        <div className="bg-white/60 rounded-lg p-4 border border-violet-100">
                          <ul className="space-y-3">
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span><strong>Platform Support:</strong> Cross-platform compatibility with modern web browsers</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span><strong>Update Policy:</strong> Regular updates with advance notification to users</span>
                            </li>
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-violet-400 to-gray-400 rounded-full mt-2.5 mr-3"></div>
                              <span><strong>Support Period:</strong> Active support and maintenance for current version</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  Version information is updated with each software release to maintain transparency and tracking.
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

export default VersionInformation;