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

export interface Invitee {
  id: string;
  guestNames: string[];
  numberOfPeople: number;
}

export interface RSVPSubmission {
  inviteeId: string;
  eventSlug: string;
  guestNames: string[];
  guestNamesDisplay: string;
  allowedPeople: number;
  attending: boolean;
  attendeeCount: number;
  message: string;
  submittedFromRoute: string;
  createdAt?: string;
  updatedAt?: string;
}

