import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getNotes } from '../lib/content';
import { site } from '../site.config';

export async function GET(context: APIContext) {
  const notes = await getNotes();
  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.date,
      link: `/notes/${note.id}`,
      categories: note.data.tags,
    })),
    customData: '<language>en-gb</language>',
  });
}
