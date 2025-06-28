import React from 'react'
import { Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center space-x-4">
          {/* Hackathon Badge */}
          <img 
            src="/white_circle_360x360.png" 
            alt="Bolt.new Hackathon Badge" 
            className="w-8 h-8 flex-shrink-0"
          />
          
          {/* Text */}
          <p className="text-sm text-gray-600 flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>for the</span>
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Bolt.new Hackathon
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}