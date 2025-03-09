import piexif
from PIL import Image, ImageChops, ImageEnhance

def check_exif(image_path):
    """
    Extracts and prints EXIF metadata from an image.
    Detects if Photoshop or editing software was used.
    """
    try:
        img = Image.open(image_path)
        exif_data = piexif.load(img.info.get("exif", b""))

        if not exif_data or not exif_data["0th"]:
            print("❌ No EXIF metadata found. This may indicate editing or metadata removal.")
            return

        print("\n📌 EXIF Metadata Found:")
        for key, value in exif_data["0th"].items():
            tag_name = piexif.TAGS["0th"].get(key, {}).get("name", key)
            print(f"{tag_name}: {value}")

        # Detect if Photoshop or any editing software was used
        software = exif_data["0th"].get(piexif.ImageIFD.Software, b"").decode("utf-8", "ignore")
        if software:
            print(f"\n⚠️ Editing Software Detected: {software}")
        else:
            print("\n✅ No Editing Software Detected in Metadata.")

    except Exception as e:
        print(f"❌ Error reading EXIF data: {e}")

def error_level_analysis(image_path):
    """
    Performs Error Level Analysis (ELA) on an image to detect manipulations.
    Brighter areas in the output indicate potential edits.
    """
    try:
        original = Image.open(image_path).convert("RGB")
        original.save("temp.jpg", quality=90)  # Re-save with known compression
        recompressed = Image.open("temp.jpg")

        diff = ImageChops.difference(original, recompressed)
        diff = ImageEnhance.Brightness(diff).enhance(20)  # Enhance to highlight changes

        print("\n📌 Displaying ELA Image... Areas with high brightness may indicate manipulation.")
        diff.show()

    except Exception as e:
        print(f"❌ Error performing ELA: {e}")

if __name__ == "__main__":
    image_path = "1.jpg"  # Change this to your image file path

    print("\n🔍 Running EXIF Metadata Analysis...")
    check_exif(image_path)

    print("\n🔍 Running Error Level Analysis (ELA)...")
    error_level_analysis(image_path)
