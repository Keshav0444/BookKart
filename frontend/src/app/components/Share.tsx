import { Share2 } from 'lucide-react';
import { RWebShare } from "react-web-share";
import { Button } from "@/components/ui/button";

interface RWebShareProps {
  url: string;
  title: string;
  text: string;
}

export const ShareButton: React.FC<RWebShareProps> = ({ url, title, text }) => {
  return (
    <RWebShare
      data={{
        text: text,
        url: url,
        title: title,
      }}
      onClick={() => console.log("shared successfully!")}
    >
      <Button size="sm" variant="outline">
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </RWebShare>
  );
};
