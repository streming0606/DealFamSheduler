import asyncio
import json
import os
from datetime import datetime
import pytz
from telegram import Bot
from telegram.error import TelegramError
import random

class GitHubActionsBot:
    def __init__(self):
        # Get from environment variables
        self.BOT_TOKEN = os.environ.get('BOT_TOKEN')
        self.DESTINATION_BOT = "@DealFamBot"
        
        # Load data
        self.links = self.load_links()
        self.current_index = self.load_progress()
        
    def load_links(self):
        """Load Amazon links from file"""
        try:
            with open('data/amazon_links.json', 'r') as f:
                data = json.load(f)
                return data.get('links', [])
        except:
            return []
    
    def save_links(self, links):
        """Save Amazon links to file"""
        os.makedirs('data', exist_ok=True)
        with open('data/amazon_links.json', 'w') as f:
            json.dump({'links': links}, f, indent=2)
    
    def load_progress(self):
        """Load current progress"""
        try:
            with open('data/progress.json', 'r') as f:
                data = json.load(f)
                return data.get('current_index', 0)
        except:
            return 0
    
    def save_progress(self):
        """Save current progress"""
        os.makedirs('data', exist_ok=True)
        with open('data/progress.json', 'w') as f:
            json.dump({
                'current_index': self.current_index,
                'last_updated': datetime.now().isoformat()
            }, f, indent=2)
    
    async def send_start_to_destination(self):
        """Send /start to destination bot"""
        try:
            bot = Bot(token=self.BOT_TOKEN)
            await bot.send_message(chat_id=self.DESTINATION_BOT, text="/start")
            print(f"✅ Sent /start to {self.DESTINATION_BOT}")
            return True
        except Exception as e:
            print(f"❌ Failed to send /start: {e}")
            return False
    
    async def send_links_batch(self, count, slot_name):
        """Send batch of links to destination bot"""
        if not self.links:
            print("❌ No links available!")
            return
        
        # Send /start first
        await self.send_start_to_destination()
        await asyncio.sleep(2)
        
        sent_count = 0
        failed_links = []
        
        for i in range(count):
            if self.current_index >= len(self.links):
                self.current_index = 0  # Reset to beginning
            
            current_link = self.links[self.current_index]
            
            try:
                bot = Bot(token=self.BOT_TOKEN)
                await bot.send_message(
                    chat_id=self.DESTINATION_BOT, 
                    text=current_link
                )
                
                print(f"✅ {slot_name}: Sent link {self.current_index + 1}/{len(self.links)}")
                sent_count += 1
                self.current_index += 1
                self.save_progress()
                
                # Wait between messages
                await asyncio.sleep(3)
                
            except Exception as e:
                print(f"❌ Failed to send link {self.current_index + 1}: {e}")
                failed_links.append(current_link)
                self.current_index += 1
        
        # Retry failed links
        for failed_link in failed_links:
            try:
                await asyncio.sleep(5)
                bot = Bot(token=self.BOT_TOKEN)
                await bot.send_message(
                    chat_id=self.DESTINATION_BOT, 
                    text=failed_link
                )
                print(f"✅ {slot_name}: Retry successful")
                sent_count += 1
            except Exception as e:
                print(f"❌ {slot_name}: Retry failed: {e}")
        
        print(f"📊 {slot_name} Complete: {sent_count}/{count} links sent")

# Main execution functions for different time slots
async def morning_slot():
    """10:12-10:20 AM - 3 links"""
    bot = GitHubActionsBot()
    await bot.send_links_batch(3, "MORNING")

async def afternoon_slot():
    """1:12-1:20 PM - 3 links"""
    bot = GitHubActionsBot()
    await bot.send_links_batch(3, "AFTERNOON")

async def evening_slot():
    """6:12-6:20 PM - 2 links"""
    bot = GitHubActionsBot()
    await bot.send_links_batch(2, "EVENING")

async def night_slot():
    """9:12-9:20 PM - 2 links"""
    bot = GitHubActionsBot()
    await bot.send_links_batch(2, "NIGHT")

# Command line execution
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python scheduler_bot.py <slot>")
        sys.exit(1)
    
    slot = sys.argv[1]
    
    if slot == "morning":
        asyncio.run(morning_slot())
    elif slot == "afternoon":
        asyncio.run(afternoon_slot())
    elif slot == "evening":
        asyncio.run(evening_slot())
    elif slot == "night":
        asyncio.run(night_slot())
    else:
        print(f"Unknown slot: {slot}")
        sys.exit(1)
