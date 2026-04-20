export interface Couple {
  titleLine: string;
  primaryNames: string;
}

export interface EventSectionItem {
  label: string;
  locationName: string;
  time: string;
  mapUrl: string;
}

export interface GatheringSection {
  enabled: boolean;
  title: string;
  description: string;
  items: EventSectionItem[];
}

export interface CeremonySection {
  enabled: boolean;
  title: string;
  dateText: string;
  time: string;
  locationName: string;
  mapUrl: string;
}

export interface ReceptionSection {
  enabled: boolean;
  title: string;
  dateText: string;
  time: string;
  locationName: string;
  mapUrl: string;
}

export interface TimelineSection {
  enabled: boolean;
  title: string;
  subtitle: string;
  image: string;
}

export interface RegistrySection {
  enabled: boolean;
  title: string;
  text: string;
  name: string;
  accountNumber: string;
}

export interface RSVPConfig {
  enabled: boolean;
  deadlineText: string;
  maxMessageLength: number;
}

export interface Branding {
  fonts: {
    body: string;
    display: string;
    accent: string;
    highlight: string;
    quote: string;
  };
  backgroundImage: string;
  overlayOpacity: number;
  accentColor: string;
  textColor: string;
  backgroundMusic?: string;
}

export interface EventSections {
  gathering: GatheringSection;
  ceremony: CeremonySection;
  reception: ReceptionSection;
  timeline: TimelineSection;
  registry: RegistrySection;
}

export interface EventConfig {
  eventSlug: string;
  couple: Couple;
  date: string;
  countdownTarget: string;
  dateTimeImage: string;
  quote: string;
  quoteSource: string;
  families: string[];
  introText: string;
  sections: EventSections;
  rsvp: RSVPConfig;
  branding: Branding;
}

/**
 * Unified Invitee Record that contains both invitation info and RSVP response
 * - Core fields (id, eventSlug, guestNames, numberOfPeople) are always present
 * - RSVP fields (attending, attendeeCount, message, etc.) are optional and only set when user responds
 * - Table field is optional and set when admin assigns invitee to a table
 */
export interface InviteeRecord {
  id: string;
  eventSlug: string;
  guestNames: string[];
  guestNamesDisplay: string; // Computed field: guestNames.join(' & ')
  numberOfPeople: number;

  // RSVP fields - optional, only present if user has responded
  attending?: boolean;
  attendeeCount?: number;
  message?: string;
  createdAt?: string;
  updatedAt?: string;

  // Table assignment - optional, set when admin assigns to a table
  table?: string;
}

/**
 * Table record for persisting table data
 */
export interface TableRecord {
  id: string;
  eventSlug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}


