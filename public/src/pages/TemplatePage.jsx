import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ImageIcon } from 'lucide-react';

const templates = [
  {
    id: 1,
    title: 'Modern Resume',
    image: 'https://template.canva.com/EAFwtyUjc9I/2/0/1131w-nB_Vy7DIy6U.jpg',
    link: 'https://www.canva.com/templates/EAFwtyUjc9I-modern-resume/'
  },
  {
    id: 2,
    title: 'Professional CV',
    image: 'https://template.canva.com/EAEekwWds8k/2/0/1131w-7O0p552EZw0.jpg',
    link: 'https://www.canva.com/templates/EAEekwWds8k-professional-cv/'
  },
  {
    id: 3,
    title: 'ATS Certified Resume',
    image: 'https://template.canva.com/EAFzH8tJ4kY/1/0/1131w-FY_IyjwDknk.jpg',
    link: 'https://www.canva.com/templates/EAFzH8tJ4kY-ats-certified-resume/'
  },
  {
    id: 4,
    title: 'Minimal Cover Letter',
    image: 'https://template.canva.com/EAE2tUxpPKA/2/0/1131w-xbun1lOE8aY.jpg',
    link: 'https://www.canva.com/templates/EAE2tUxpPKA-minimal-cover-letter/'
  },
  {
    id: 5,
    title: 'Modern Cover Letter',
    image: 'https://template.canva.com/EAE7E5BsBG0/2/0/1131w-eWMqPKKghxI.jpg',
    link: 'https://www.canva.com/templates/EAE7E5BsBG0-modern-cover-letter/'
  },
  {
    id: 6,
    title: 'Clean Cover Letter',
    image: 'https://template.canva.com/EAE_dVkd4js/1/0/1131w-jVnA3DeK23w.jpg',
    link: 'https://www.canva.com/templates/EAE_dVkd4js-clean-cover-letter/'
  },
  {
    id: 7,
    title: 'Elegant Cover Letter',
    image: 'https://template.canva.com/EAFzOshhfWk/6/0/1131w-JIPDX2e7b-Y.jpg',
    link: 'https://www.canva.com/templates/EAFzOshhfWk-elegant-cover-letter/'
  },
  {
    id: 8,
    title: 'Bold Cover Letter',
    image: 'https://template.canva.com/EAGQ-IIGNa0/1/0/1131w-RZAonb9ZjgE.jpg',
    link: 'https://www.canva.com/templates/EAGQ-IIGNa0-bold-cover-letter/'
  },
  {
    id: 9,
    title: 'Graphic Cover Letter',
    image: 'https://template.canva.com/EAGIvMa6hAE/1/0/1131w-xKahNueCKdM.jpg',
    link: 'https://www.canva.com/templates/EAGIvMa6hAE-graphic-cover-letter/'
  },
  {
    id: 10,
    title: 'Creative Cover Letter',
    image: 'https://template.canva.com/EAGQ-IIGNa0/1/0/1131w-RZAonb9ZjgE.jpg',
    link: 'https://www.canva.com/templates/EAGQ-IIGNa0-creative-cover-letter/'
  },
  {
    id: 11,
    title: 'Colorful Cover Letter',
    image: 'https://template.canva.com/EAGHPODRmRM/1/0/1131w-wnGpudXZF_U.jpg',
    link: 'https://www.canva.com/templates/EAGHPODRmRM-colorful-cover-letter/'
  },
  {
    id: 12,
    title: 'Neat Cover Letter',
    image: 'https://template.canva.com/EAGFXKC8e-Y/1/0/1131w-RlEDSGh-ejk.jpg',
    link: 'https://www.canva.com/templates/EAGFXKC8e-Y-neat-cover-letter/'
  },
];

const TemplateCard = ({ title, image, link }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => window.open(link, '_blank')}
    className="rounded-xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-all duration-300 cursor-pointer"
  >
    <div className="w-full aspect-[827/1169] bg-slate-200">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  </motion.div>
);

const TemplatePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6 cursor-pointer select-none"
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6" /> Canva Templates
        </h1>
        <p className="text-gray-500 mt-2">Choose from beautiful, ready-to-edit resume templates!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {templates.map((template) => (
          <TemplateCard key={template.id} {...template} />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center mt-12 text-gray-500">
          <ImageIcon className="mx-auto w-10 h-10 mb-2" />
          No templates available yet.
        </div>
      )}
    </motion.div>
  );
};

export default TemplatePage;
