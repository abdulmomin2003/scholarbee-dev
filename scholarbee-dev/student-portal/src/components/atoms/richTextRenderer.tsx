import React from 'react';
import { PortableText, PortableTextReactComponents } from '@portabletext/react';
import { transformToPortableText } from '@/utils/helperFunctions';

const components: Partial<PortableTextReactComponents> = {
  marks: {
    bold: ({ children }) => <strong>{children}</strong>
  },
  block: {
    normal: ({ children }) => <p>{children}</p>
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RichTextRenderer = ({ data }: { data: any[] }) => {
  const portableTextContent = transformToPortableText(data);

  return (
    <div>
      {data.map((section, index) => (
        <div key={index}>
          <h3>{section.key}</h3>
          <PortableText value={portableTextContent} components={components} />
        </div>
      ))}
    </div>
  );
};

export default RichTextRenderer;
