import { RWebShare } from "react-web-share";
import { Button } from "@/components/ui/button"; // Adjust the import based on your project structure
import { Share2 } from "lucide-react"; // Ensure lucide-react is installed

interface par {
  title: string
  text: string
  url: string
}

const ShareButton = ({ title, text, url }: par) => {
  // Format the message for sharing
  const formattedText = `${title}\n\n${text.slice(0, 200)}...\n\nRead more: ${url}`;

  return (
    <RWebShare
      data={{
        text: formattedText,
        // title: title,
        // url: url, // Some apps auto-detect this link, but it's also in the text
      }}
    >
      <Button variant="ghost" size="icon" className="rounded-full">
        <Share2 className="h-5 w-5" />
      </Button>
    </RWebShare>
  );
};

export default ShareButton;
