import { EventConfig } from '../models/invitation.models';

export const EVENT_CONFIG: EventConfig = {
  eventSlug: 'elia-gayel',
  couple: {
    titleLine: 'Are getting married',
    primaryNames: 'Elia & Gayel',
  },
  date: '2026-08-16T17:30:00+03:00',
  countdownTarget: '2026-08-16T17:30:00+03:00',
  quote: 'Therefore what God has joined together, let no one separate.',
  quoteSource: 'Mark 10:9',
  families: [
    'Mr. & Mrs. Abdo & Nada El Hage',
    'General Imad & Mrs. Itab Abou Imad',
  ],
  introText: 'Joyfully request your presence at the wedding of their children',
  sections: {
    gathering: {
      enabled: true,
      title: 'The Gathering',
      description:
        "The festivities will commence with a gathering at the bride's and the groom's places.",
      items: [
        {
          label: "Bride's Place",
          locationName: 'Cornet Chahwane',
          time: 'Starting 2:30 pm',
          mapUrl: 'https://maps.google.com',
        },
        {
          label: "Groom's Place",
          locationName: 'Jdeideh',
          time: 'Starting 2:30 pm',
          mapUrl: 'https://maps.google.com',
        },
      ],
    },
    ceremony: {
      enabled: true,
      title: 'Wedding Ceremony',
      dateText: 'Saturday, July 18, 2026',
      time: '5:30 pm',
      locationName: 'Church Name, City',
      mapUrl: 'https://maps.google.com',
    },
    reception: {
      enabled: true,
      title: 'Reception',
      dateText: 'Saturday, July 18, 2026',
      time: '7:15 pm',
      locationName: 'Domaine de Bherdok',
      mapUrl: 'https://maps.google.com',
    },
    timeline: {
      enabled: true,
      title: 'Road to forever',
      subtitle: 'Wedding day Timeline',
      image: '/assets/timeline.svg',
    },
    registry: {
      enabled: true,
      title: 'Gift Registry',
      text: 'The greatest gift we could have is your presence. For those who wish, a wedding list will be available at',
      name: 'WHISH MONEY',
      accountNumber: '30457905',
    },
  },
  rsvp: {
    enabled: true,
    deadlineText: 'Confirmation before July 1, 2026',
    maxMessageLength: 120,
  },
  branding: {
    backgroundImage: '/assets/background.jpg',
    overlayOpacity: 0.45,
    accentColor: '#d6c3a5',
    textColor: '#ffffff',
  },
};

