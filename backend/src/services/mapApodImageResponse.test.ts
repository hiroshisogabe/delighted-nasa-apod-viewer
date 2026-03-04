import { mapDailyApodImageResponse, mapRandomApodImageResponse } from './mapApodImageResponse';

describe('mapDailyApodImageResponse', () => {
  it('maps a valid daily image payload', () => {
    const mappedImage = mapDailyApodImageResponse({
      title: 'Pillars of Creation',
      date: '2026-01-12',
      explanation: 'A famous Hubble image',
      media_type: 'image',
      url: 'https://example.com/image.jpg',
      copyright: 'NASA'
    });

    expect(mappedImage).toEqual({
      title: 'Pillars of Creation',
      date: '2026-01-12',
      explanation: 'A famous Hubble image',
      imageUrl: 'https://example.com/image.jpg',
      copyright: 'NASA'
    });
  });

  it('throws when payload is not an image', () => {
    expect(() =>
      mapDailyApodImageResponse({
        title: 'Video payload',
        date: '2026-01-12',
        explanation: 'Not supported',
        media_type: 'video',
        url: 'https://example.com/video.mp4'
      })
    ).toThrow('NASA APOD payload is not an image');
  });

  it('throws when required fields are missing', () => {
    expect(() =>
      mapDailyApodImageResponse({
        media_type: 'image',
        url: 'https://example.com/image.jpg'
      })
    ).toThrow('NASA APOD payload is missing title');
  });
});

describe('mapRandomApodImageResponse', () => {
  it('maps the first element from a valid random payload', () => {
    const mappedImage = mapRandomApodImageResponse([
      {
        title: 'Random image',
        date: '2026-01-13',
        explanation: 'Random APOD entry',
        media_type: 'image',
        url: 'https://example.com/random.jpg'
      }
    ]);

    expect(mappedImage).toEqual({
      title: 'Random image',
      date: '2026-01-13',
      explanation: 'Random APOD entry',
      imageUrl: 'https://example.com/random.jpg'
    });
  });

  it('throws for an empty random payload', () => {
    expect(() => mapRandomApodImageResponse([])).toThrow('NASA APOD random payload is invalid');
  });
});
