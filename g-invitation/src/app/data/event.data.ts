import { EventConfig } from '../models/invitation.models';

export const EVENT_CONFIG: EventConfig = {
  eventSlug: 'elia-gayel',
  couple: {
    titleLine: 'Are getting married',
    primaryNames: 'Elia & Gayel',
  },
  date: '2026-07-18T17:30:00+03:00',
  countdownTarget: '2026-07-18T17:30:00+03:00',
  dateTimeImage: '/assets/date-time.svg',
  quote: 'Therefore what God has joined together, let no one separate.',
  quoteSource: 'Mark 10:9',
  families: [
    'Mr. Abdo &  Mrs. Nada El Hage',
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
          mapUrl: 'https://maps.app.goo.gl/Rug3WohGEXzp2jDj6',
        },
        {
          label: "Groom's Place",
          locationName: 'Jdeideh',
          time: 'Starting 2:30 pm',
          mapUrl: 'https://maps.app.goo.gl/xSZwmNv7ryU4sdcP9',
        },
        {
          label: 'Ceremony and Dinner',
          time: '6:00 pm',
          locationName: 'Domaine de Bherdok - Beit Chabab',
          mapUrl: 'https://maps.app.goo.gl/Smwcp9TGd1uvfkpz8',
        }
      ],
    },
    ceremony: {
      enabled: false,
      title: 'Wedding Ceremony',
      dateText: 'Saturday, July 18, 2026',
      time: '5:30 pm',
      locationName: 'Church Name, City',
      mapUrl: 'https://maps.google.com',
    },
    reception: {
      enabled: false,
      title: 'Ceremony and Dinner',
      dateText: 'Saturday, July 18, 2026',
      time: '7:15 pm',
      locationName: 'Domaine de Bherdok - Beit Chabab',
      mapUrl: 'https://maps.app.goo.gl/Smwcp9TGd1uvfkpz8',
    },
    timeline: {
      enabled: true,
      title: 'Road to forever',
      subtitle: 'Wedding Timeline',
      image: '/assets/timeline.svg',
    },
    registry: {
      enabled: true,
      title: 'Gift Registry',
      text: 'The greatest gift we could have is your presence. For those who wish, a wedding list will be available at',
      name: 'WHISH MONEY',
      accountNumber: '20998174',
    },
  },
  rsvp: {
    enabled: true,
    deadlineText: 'Confirmation before June 1, 2026',
    maxMessageLength: 120,
  },
  branding: {
    fonts: {
      body: "'Varela Round', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "'Great Vibes', cursive",
      accent: "'Quicksand', sans-serif",
      highlight: "'Quicksand', sans-serif",
      quote: "'Georgia', serif",
    },
    backgroundImage: 'assets/galaxy_invitation_border.svg',
    overlayOpacity: 0,
    accentColor: '#d7dde3',
    textColor: '#4f555b',
    backgroundMusic: '/assets/kawkabi-trimmed.mpeg',
  },
};

