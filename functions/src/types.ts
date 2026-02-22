
export interface JsonLdSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface MetaTags {
  title: string;
  description: string;
}

export interface OpenGraph {
  'og:title': string;
  'og:description': string;
  'og:type': string;
  'og:url': string;
  'og:image': string;
}

export interface TwitterCard {
  'twitter:card': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
}

export interface SeoInjectionPackage {
  jsonLd: {
    Organization: JsonLdSchema;
    WebSite: JsonLdSchema;
    LocalBusiness: JsonLdSchema;
  };
  metaTags: MetaTags;
  openGraph: OpenGraph;
  twitterCard: TwitterCard;
}

export interface SiteData {
  brandName: string;
  heroImage: string | null;
  headings: string[];
  description: string;
  images: string[];
  paragraphs: string[];
  listItems: string[];
}

export interface SeoVariant {
  name: string;
  description: string;
  seoPackage: SeoInjectionPackage;
  optimizedScore: number;
  opportunities: string[];
  previewImage?: string;
}

export interface SeoAnalysisResult {
  originalScore: number;
  variants: SeoVariant[];
}

export interface Review {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: string;
  authorPhotoUri?: string;
}

export interface Place {
  id: string;
  reviews?: Review[];
  name: string;
  address: string;
  phone?: string | null;
  website?: string | null;
  icon?: string | null;
  socials: string[]; // Array of URLs
  email?: string | null;
  contactName?: string | null;
  googleMapsUri?: string | null;
  rating?: number | null;
  userRatingCount?: number | null;
  businessStatus?: string | null;
  priceLevel?: string | null;
  primaryType?: string | null;
  regularOpeningHours?: any | null; // Complex object, simplified for now
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;

  // Custom fields for UI compatibility
  status?: string;
  channel?: string;
  location?: string;
}

export interface FilterOptions {
  industry: string;
  state: string;
  city: string;
  websiteStatus: 'all' | 'has_website' | 'no_website';
  deepScan?: boolean; // Enable recursive multi-region scans
  maxResults: number;
  goldMine?: boolean; // Automates discovery of high-LTV businesses
}

// --- 20i / Reseller Types ---

export interface TwentyIPackageTier {
  id: string; // The 20i 'type' ID (e.g., '284869')
  name: string; // 'Basic', 'Pro', 'Ultimate'
  blueprintId: string; // The specific BrandLift blueprint ID to deploy
  specs: {
    disk: string;
    bandwidth: string;
    sites: number;
  };
}

export interface ProvisioningRequest {
  domain: string;
  blueprintId: string;
  packageType: string; // 'basic', 'pro', 'ultimate'
  customer: {
    email: string;
    name?: string;
    company?: string;
  };
}

export interface CustomerStatus {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'delinquent' | 'pending';
  totalSites: number;
  monthlyRevenue: number;
  delinquentDays?: number; // For alerts
}

export interface CapabilitySettings {
  enablePlugins: boolean;
  enableThemeEditing: boolean;
  enableTextEdit: boolean;
  lockdownMode: boolean;
}
