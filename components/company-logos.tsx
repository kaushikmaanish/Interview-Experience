"use client"

import * as React from "react";
import Image from "next/image";

interface CompanyLogosProps {
  className?: string;
}

export function CompanyLogos({ className }: CompanyLogosProps) {
  const companies = [
    { name: "Google", logo: "/logos/google.png" },
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Microsoft", logo: "/logos/microsoft.png" },
    { name: "Apple", logo: "/logos/apple.png" },
    { name: "Meta", logo: "/logos/meta.png" },
    { name: "Netflix", logo: "/logos/netflix.png" },
  ];

  return (
    <div className={className}>
      <div className="flex flex-wrap justify-center gap-8 items-center">
        {companies.map((company) => (
          <div
            key={company.name}
            className="relative w-40 h-20 grayscale hover:grayscale-0 transition-all"
          >
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
