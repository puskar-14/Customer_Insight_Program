import random

def generate_ai_content(title: str, category: str):
    """
    Our 'AI' content generator! 🤖
    In a real-world scenario, this would hook into the Gemini API or OpenAI.
    For now, we're using a clever little heuristic template system to fake it 
    so you don't need API keys to run the project.
    """
    taglines = [
        f"Elevate your lifestyle with our premium {title}.",
        f"The ultimate {category} experience: {title}.",
        f"Discover the true meaning of quality with {title}.",
        f"Upgrade your {category} collection today.",
        f"{title}: Where innovation meets elegance."
    ]
    
    descriptions = [
        f"Introducing the {title}, a masterpiece in the {category} category. Designed with precision and crafted from the finest materials, it promises unmatched performance and durability. Whether you're a professional or an enthusiast, this is the perfect addition to your arsenal.",
        f"Experience the next level of {category} with our revolutionary {title}. It blends modern aesthetics with functional design to bring you a product that not only looks great but performs exceptionally well in every scenario.",
        f"The {title} is our latest offering in {category}. We've taken user feedback to heart to create a product that addresses all your needs. Compact, powerful, and easy to use, it's everything you've ever wanted."
    ]
    
    marketing_emails = [
        f"Subject: Meet your new favorite {category} - The {title}!\n\nHi there,\n\nWe're thrilled to introduce you to the {title}, our newest arrival. It's designed to make your life easier and more enjoyable. Order now and get exclusive early-bird pricing!\n\nBest,\nThe Shop Sense Team",
        f"Subject: Upgrade time! Discover the {title}\n\nHello!\n\nIf you're looking for the best in {category}, look no further. The {title} is finally here. With its cutting-edge features and sleek design, it's a game-changer. Click here to learn more and secure yours today.\n\nCheers,\nShop Sense"
    ]
    
    return {
        "tagline": random.choice(taglines),
        "description": random.choice(descriptions),
        "marketing_email": random.choice(marketing_emails)
    }
