import { NasaApodUnsupportedMediaError } from '../types/apod';
import { mapDailyApodMediaResponse, mapRandomApodMediaResponse } from './mapApodMediaResponse';

describe('mapDailyApodMediaResponse', () => {
  it('maps a valid daily image payload', () => {
    const mappedMedia = mapDailyApodMediaResponse({
      title: 'Pillars of Creation',
      date: '2026-01-12',
      explanation: 'A famous Hubble image',
      media_type: 'image',
      url: 'https://example.com/image.jpg',
      copyright: 'NASA'
    });

    expect(mappedMedia).toEqual({
      title: 'Pillars of Creation',
      date: '2026-01-12',
      explanation: 'A famous Hubble image',
      mediaType: 'image',
      mediaUrl: 'https://example.com/image.jpg',
      copyright: 'NASA'
    });
  });

  it('maps a valid daily direct-playable video payload', () => {
    const mappedMedia = mapDailyApodMediaResponse({
      title: 'Aurora Time-lapse',
      date: '2026-01-14',
      explanation: 'Direct-playable APOD video',
      media_type: 'video',
      url: 'https://example.com/clip.mp4',
      thumbnail_url: 'https://example.com/clip.jpg'
    });

    expect(mappedMedia).toEqual({
      title: 'Aurora Time-lapse',
      date: '2026-01-14',
      explanation: 'Direct-playable APOD video',
      mediaType: 'video',
      mediaUrl: 'https://example.com/clip.mp4',
      thumbnailUrl: 'https://example.com/clip.jpg'
    });
  });

  it('throws unsupported media error when media_type is not image or video', () => {
    expect(() =>
      mapDailyApodMediaResponse({
        title: 'Audio entry',
        date: '2026-01-15',
        explanation: 'Unsupported media type',
        media_type: 'audio',
        url: 'https://example.com/audio.mp3'
      })
    ).toThrow(NasaApodUnsupportedMediaError);
  });

  it('throws unsupported media error when video URL is not direct-playable', () => {
    expect(() =>
      mapDailyApodMediaResponse({
        title: 'Embedded video',
        date: '2026-01-16',
        explanation: 'Provider page URL',
        media_type: 'video',
        url: 'https://www.youtube.com/watch?v=abc123'
      })
    ).toThrow(NasaApodUnsupportedMediaError);
  });
});

describe('mapRandomApodMediaResponse', () => {
  it('maps the first element from a valid random payload', () => {
    const mappedMedia = mapRandomApodMediaResponse([
      {
        title: 'Random image',
        date: '2026-01-13',
        explanation: 'Random APOD entry',
        media_type: 'image',
        url: 'https://example.com/random.jpg'
      }
    ]);

    expect(mappedMedia).toEqual({
      title: 'Random image',
      date: '2026-01-13',
      explanation: 'Random APOD entry',
      mediaType: 'image',
      mediaUrl: 'https://example.com/random.jpg'
    });
  });

  it('throws for an empty random payload', () => {
    expect(() => mapRandomApodMediaResponse([])).toThrow('NASA APOD random payload is invalid');
  });
});
