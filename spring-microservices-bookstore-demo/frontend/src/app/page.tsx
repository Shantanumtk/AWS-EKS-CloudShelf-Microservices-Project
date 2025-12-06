'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, TrendingUp, Star, Package, Search, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userName } = useAuth();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        wishlistCount={0}
        onSearch={handleSearch}
        isAuthenticated={isAuthenticated}
        userName={userName || undefined}
      />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Welcome to <span className="text-primary">BookVerse</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Discover, explore, and immerse yourself in millions of digital books
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/browse">
                  <Button size="lg" className="text-lg px-8 py-6">
                    <BookOpen className="mr-2" size={20} />
                    Start Browsing
                  </Button>
                </Link>
                <Link href="/bestsellers">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    <TrendingUp className="mr-2" size={20} />
                    View Bestsellers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/40">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose BookVerse?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="text-primary" size={24} />
                  </div>
                  <CardTitle>Vast Collection</CardTitle>
                  <CardDescription>
                    Access millions of books across every genre imaginable
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="text-primary" size={24} />
                  </div>
                  <CardTitle>Personalized Recommendations</CardTitle>
                  <CardDescription>
                    Discover your next favorite read with AI-powered suggestions
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Package className="text-primary" size={24} />
                  </div>
                  <CardTitle>Instant Delivery</CardTitle>
                  <CardDescription>
                    Start reading immediately with instant digital access
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Explore Popular Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Fiction', icon: '📚' },
                { name: 'Science', icon: '🔬' },
                { name: 'History', icon: '🏛️' },
                { name: 'Technology', icon: '💻' },
                { name: 'Self-Help', icon: '🌟' },
                { name: 'Business', icon: '💼' },
                { name: 'Art & Design', icon: '🎨' },
                { name: 'Biography', icon: '👤' },
              ].map((category) => (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-muted-foreground mt-2">Coming Soon</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Reading Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of readers discovering their next favorite book
            </p>
            {!isAuthenticated ? (
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Sign Up Now - It's Free!
                </Button>
              </Link>
            ) : (
              <Link href="/browse">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  <Search className="mr-2" size={20} />
                  Explore Books
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40 py-12">
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
                  <Link href="/help" className="text-muted-foreground hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
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