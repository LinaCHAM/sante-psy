import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@dataesr/react-dsfr';

const Ariane = ({ previous, current }) => (
  <Breadcrumb>
    {previous.map(item => (
      <BreadcrumbItem
        key={item.label}
        href={item.url}
      >
        {item.label}
      </BreadcrumbItem>
    ))}
    <BreadcrumbItem>
      {current}
    </BreadcrumbItem>
  </Breadcrumb>
);

export default Ariane;
