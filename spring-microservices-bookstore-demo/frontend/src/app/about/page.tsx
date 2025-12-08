'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Shield, 
  HelpCircle, 
  Mail, 
  Book,
  ChevronRight
} from 'lucide-react';

export default function InfoPage() {
  const router = useRouter();
  const { isAuthenticated, userName } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('terms');

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const sections = [
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'contact', label: 'Contact Us', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        wishlistCount={0}
        onSearch={handleSearch}
        isAuthenticated={isAuthenticated}
        userName={userName || undefined}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Book className="text-primary" size={32} />
            <h1 className="text-4xl md:text-5xl font-bold">Information & Support</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about BookVerse policies, privacy, and getting help.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto">
          {/* Terms of Service */}
          {activeSection === 'terms' && (
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="text-primary" />
                  Terms of Service
                </CardTitle>
                <CardDescription>Last updated: December 2024</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Agreement to Terms</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing BookVerse, you agree to be bound by these Terms of Service and our Privacy Policy. 
                    If you disagree with any part of these terms, you may not access our service.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. User Accounts</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials. 
                    All activities that occur under your account are your responsibility. Notify us immediately 
                    of any unauthorized use of your account.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. Content & Intellectual Property</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All books, images, and content available on BookVerse are protected by copyright and other 
                    intellectual property laws. You may not reproduce, distribute, or create derivative works 
                    without express written permission from the copyright holders.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Purchases & Refunds</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All sales are final unless the digital content is defective or fails to download properly. 
                    Refund requests must be submitted within 7 days of purchase. We reserve the right to 
                    modify pricing and availability without prior notice.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Prohibited Conduct</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You may not use BookVerse to: violate any laws, infringe on intellectual property rights, 
                    distribute malware, engage in fraudulent activity, or harass other users. Violations may 
                    result in immediate account termination.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Limitation of Liability</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    BookVerse is provided "as is" without warranties of any kind. We are not liable for any 
                    indirect, incidental, or consequential damages arising from your use of the service.
                  </p>
                </section>
              </CardContent>
            </Card>
          )}

          {/* Privacy Policy */}
          {activeSection === 'privacy' && (
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="text-primary" />
                  Privacy Policy
                </CardTitle>
                <CardDescription>Your privacy matters to us</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">Information We Collect</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We collect information you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Account registration details (name, email, password)</li>
                    <li>Payment information (processed securely by third-party providers)</li>
                    <li>Reading preferences and purchase history</li>
                    <li>Device information and browsing patterns</li>
                    <li>Communication preferences and support inquiries</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">How We Use Your Information</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Your data helps us provide and improve our services:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Process orders and deliver digital content</li>
                    <li>Personalize book recommendations</li>
                    <li>Send transactional emails and order confirmations</li>
                    <li>Improve our platform and user experience</li>
                    <li>Prevent fraud and ensure platform security</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Data Sharing & Third Parties</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We do not sell your personal information. We may share data with trusted service providers 
                    who assist in operating our platform (payment processors, analytics providers, cloud storage). 
                    All partners are contractually bound to protect your data.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Your Privacy Rights</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You have the right to access, correct, or delete your personal information. You may also 
                    opt out of marketing communications at any time. Contact our support team to exercise 
                    these rights.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Cookies & Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies to enhance your browsing experience, analyze site traffic, and remember 
                    your preferences. You can control cookie settings through your browser, though some 
                    features may not function properly if disabled.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Data Security</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures including encryption, secure servers, 
                    and regular security audits. However, no method of transmission over the internet is 
                    100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>
              </CardContent>
            </Card>
          )}

          {/* Help Center */}
          {activeSection === 'help' && (
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <HelpCircle className="text-primary" />
                  Help Center
                </CardTitle>
                <CardDescription>Find answers to common questions</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
                  <div className="space-y-3">
                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">How do I create an account?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        Click "Sign Up" in the top right corner, enter your email, create a password, and verify 
                        your email address. Your account will be ready immediately.
                      </p>
                    </details>

                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">Is registration required to browse books?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        No, you can browse our entire catalog as a guest. However, you'll need an account to 
                        make purchases, add items to your wishlist, or leave reviews.
                      </p>
                    </details>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Purchasing & Payments</h3>
                  <div className="space-y-3">
                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">What payment methods do you accept?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        We accept all major credit cards (Visa, Mastercard, American Express), PayPal, 
                        and digital wallets like Apple Pay and Google Pay.
                      </p>
                    </details>

                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">How do I download my purchased books?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        After purchase, visit your "My Books" page from your profile menu. Click the download 
                        button next to any book to save it to your device. Books are available in multiple formats.
                      </p>
                    </details>

                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">Can I request a refund?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        Refunds are available within 7 days if your book has a technical issue or you were 
                        charged incorrectly. Contact support with your order number for assistance.
                      </p>
                    </details>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Account Management</h3>
                  <div className="space-y-3">
                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">How do I reset my password?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        Click "Forgot Password" on the login page, enter your email, and we'll send you a 
                        password reset link. The link expires after 24 hours for security.
                      </p>
                    </details>

                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">Can I change my email address?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        Yes, go to your Profile Settings and click "Edit Profile". Enter your new email and 
                        verify it before the change takes effect.
                      </p>
                    </details>

                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">How do I delete my account?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        Navigate to Profile Settings and scroll to the bottom to find "Delete Account". 
                        This action is permanent and will remove all your data from our systems.
                      </p>
                    </details>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Technical Support</h3>
                  <div className="space-y-3">
                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">What browsers are supported?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        BookVerse works best on the latest versions of Chrome, Firefox, Safari, and Edge. 
                        We recommend keeping your browser updated for optimal performance and security.
                      </p>
                    </details>

                    <details className="group cursor-pointer">
                      <summary className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="group-open:rotate-90 transition-transform" size={16} />
                        <span className="font-medium">Is there a mobile app available?</span>
                      </summary>
                      <p className="mt-2 ml-6 text-sm text-muted-foreground">
                        Not yet, but BookVerse is fully mobile-responsive and works seamlessly in mobile 
                        browsers. A dedicated mobile app is in our roadmap for future release.
                      </p>
                    </details>
                  </div>
                </section>
              </CardContent>
            </Card>
          )}

          {/* Contact Us */}
          {activeSection === 'contact' && (
            <Card className="border-2">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Mail className="text-primary" />
                  Contact Us
                </CardTitle>
                <CardDescription>We're here to help</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <section>
                  <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Have a question, suggestion, or need assistance? Our support team is ready to help you 
                    with any inquiries about BookVerse.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Mail className="text-primary" size={24} />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Email Support</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              For general inquiries and support
                            </p>
                            <a 
                              href="mailto:support@bookverse.com" 
                              className="text-primary hover:underline text-sm font-medium"
                            >
                              support@bookverse.com
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Shield className="text-primary" size={24} />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Security Issues</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Report vulnerabilities or security concerns
                            </p>
                            <a 
                              href="mailto:security@bookverse.com" 
                              className="text-primary hover:underline text-sm font-medium"
                            >
                              security@bookverse.com
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Book className="text-primary" size={24} />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Content Issues</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Report incorrect or problematic content
                            </p>
                            <a 
                              href="mailto:content@bookverse.com" 
                              className="text-primary hover:underline text-sm font-medium"
                            >
                              content@bookverse.com
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <HelpCircle className="text-primary" size={24} />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Business Inquiries</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Partnerships, press, and media relations
                            </p>
                            <a 
                              href="mailto:business@bookverse.com" 
                              className="text-primary hover:underline text-sm font-medium"
                            >
                              business@bookverse.com
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4">Response Times</h3>
                  <div className="bg-muted/30 rounded-lg p-6">
                    <p className="text-muted-foreground mb-4">
                      We aim to respond to all inquiries within:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <ChevronRight className="text-primary" size={16} />
                        <span><strong>General Support:</strong> 24-48 hours</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="text-primary" size={16} />
                        <span><strong>Technical Issues:</strong> 12-24 hours</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ChevronRight className="text-primary" size={16} />
                        <span><strong>Security Reports:</strong> 4-8 hours</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-4">Mailing Address</h3>
                  <div className="bg-muted/30 rounded-lg p-6">
                    <p className="text-muted-foreground">
                      BookVerse LLC<br />
                      123 Digital Avenue, Suite 400<br />
                      San Francisco, CA 94102<br />
                      United States
                    </p>
                  </div>
                </section>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Links Footer */}
        <div className="mt-16 p-8 bg-muted/30 rounded-lg text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? Visit our{' '}
            <Link href="/browse" className="text-primary hover:underline font-medium">
              Browse Books
            </Link>
            {' '}page or{' '}
            <Link href="/" className="text-primary hover:underline font-medium">
              return to the home page
            </Link>
            .
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">About BookVerse</h3>
              <p className="text-sm text-muted-foreground">
                Your one-stop destination for digital books across all genres.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/browse" className="text-muted-foreground hover:text-primary">
                    Browse Books
                  </Link>
                </li>
                <li>
                  <Link href="/bestsellers" className="text-muted-foreground hover:text-primary">
                    Bestsellers
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-muted-foreground hover:text-primary">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => setActiveSection('help')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('contact')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => setActiveSection('terms')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveSection('privacy')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 BookVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}