Add a new **Personalized Avatar Campaign** workflow inside the existing EffySocial AI Studio. Do not redesign the existing application, navigation, visual system, AI Studio, YouTube Story, Multi-Short or other completed modules. Extend the current product using the same Bright Studio coral/cream design language, warm-charcoal navigation, components, patterns and data structures already established.

This workflow is for large branded campaigns such as Pidilite’s Raksha Bandhan campaign, where one master video is created and then personalized for hundreds or thousands of individual dealers.

## Core concept

A campaign administrator creates one branded master video containing fixed scenes, music, product branding, transitions and story structure.

Each dealer then provides:

* One clear portrait photograph
* Optional additional reference photographs
* Dealer name
* Shop or business name
* City or territory
* Preferred language
* Optional voice sample
* Optional personalized message

EffySocial converts the dealer into a consistent cartoon or motion-comic avatar and inserts that same character into the master video without changing the person’s facial identity, hairstyle, beard, glasses, skin tone or other recognizable features between scenes.

The final campaign version must include:

* Two to three consistent avatar poses
* Two personalized dialogue slots
* A dealer-specific branding line
* Dealer name, shop name and city
* Multilingual output
* Optional cloned dealer voice or approved preset voice
* WhatsApp sharing version
* Instagram Reel version
* YouTube Short version

## Most important requirement: identity and visual consistency

This is not a normal text-to-video generator where every scene generates a different-looking person.

Create a **Dealer Avatar Identity Lock** system.

After the dealer uploads their photograph:

1. Generate a reusable avatar reference pack.
2. Produce a neutral front-facing avatar.
3. Produce two or three approved poses, such as:

   * Neutral standing pose
   * Speaking or greeting pose
   * Protective/confident or folded-hands festive pose
4. Keep the same:

   * Facial structure
   * Hair
   * Beard or moustache
   * Glasses
   * Skin tone
   * Age appearance
   * Outfit
   * Body proportions
   * Illustration style
5. Save the approved avatar as a reusable campaign asset.
6. Use the approved reference avatar in every scene rather than regenerating the dealer independently for each shot.
7. Provide a clear **Lock Identity** action after approval.
8. Regenerating a pose must preserve the locked face and character styling.
9. Never allow the avatar’s facial identity, outfit or art style to drift between scenes.
10. Show a consistency warning when a newly generated pose differs materially from the approved reference.

Design an **Avatar Consistency Panel** showing:

* Original uploaded photograph
* Approved avatar reference
* Pose variations
* Identity locked/unlocked status
* Facial similarity status
* Outfit consistency
* Style consistency
* Regenerate pose
* Replace source photograph
* Approve avatar pack

## Campaign creation workflow

### Step 1 — Campaign setup

Allow the campaign administrator to define:

* Campaign name
* Brand
* Occasion
* Master message
* Product or product category
* Campaign language options
* Campaign duration
* Target dealer group
* Brand guidelines
* Required disclaimer
* Output platforms

Example campaign:

**Pidilite Raksha Bandhan — Ghar Ki Raksha, Behen Ki Raksha**

### Step 2 — Master video

Allow the administrator to upload or create the master video using the existing AI Studio.

The master video contains:

* Fixed background scenes
* Brand animation
* Product shots
* Music
* Transitions
* Non-personalized narration
* Avatar placeholder scenes
* Personalized dialogue markers
* Dealer branding placeholder
* Final branded end card

Show the master video as a visual timeline with clearly marked personalization slots:

* Avatar Slot 1
* Dialogue Slot 1
* Avatar Slot 2
* Dialogue Slot 2
* Dealer Branding Line
* Dealer End Card

The administrator should be able to define which sections remain fixed and which sections can be personalized.

### Step 3 — Dealer onboarding

Create a dealer input form that can be completed by:

* The campaign administrator
* The dealer through a shareable campaign link
* Bulk CSV import
* API or CRM import

Fields:

* Dealer photograph
* Additional reference photographs
* Dealer name
* Shop name
* Location
* Phone number
* Language
* Voice preference
* Voice sample
* Approval consent
* Custom message

Show photo-quality guidance before submission:

* Front-facing image
* Good lighting
* No heavy filters
* Face clearly visible
* Avoid sunglasses
* Minimum resolution requirement

### Step 4 — Avatar creation

Create the avatar reference pack and two to three poses.

The user should be able to:

* Compare the photograph and generated avatar
* Select from controlled avatar variations
* Adjust outfit within approved campaign options
* Select expression
* Approve or regenerate individual poses
* Lock the final avatar identity

Use one campaign-wide art direction so every dealer avatar belongs to the same Pidilite motion-comic universe while still preserving each dealer’s identity.

### Step 5 — Personalized script

Create two editable dialogue slots.

Example structure:

**Dialogue 1:**
A campaign-related emotional or festive line.

**Dialogue 2:**
A personalized greeting or protective promise spoken by the dealer.

Add a dealer-specific branding line such as:

“Main Rajesh Gupta, Gupta Hardware, Delhi se, Pidilite ke saath aapke ghar ki mazbooti aur rishton ki suraksha ka vaada karta hoon.”

Allow the administrator to define:

* Fixed words
* Variable fields
* Dealer name insertion
* Shop name insertion
* City insertion
* Product insertion
* Character limit
* Tone
* Language
* Pronunciation overrides

Generate script previews in all enabled languages while preserving the original campaign meaning rather than using literal low-quality translations.

### Step 6 — Voice generation

Provide these options:

* Dealer voice clone using an uploaded sample
* Approved campaign male voice
* Approved campaign female voice
* Regional-language voice
* Administrator-uploaded voiceover

Show:

* Voice preview
* Language
* Pronunciation editor
* Speed
* Tone
* Emotional style
* Voice consent status
* Regenerate audio

Clearly separate generated voice consent and approval from normal media upload consent.

### Step 7 — Lip-sync and scene insertion

Insert the approved dealer avatar into designated master-video scenes.

Apply:

* Lip-sync to the personalized dialogue
* Controlled facial expressions
* Subtle body motion
* Pose changes
* Gesture timing
* Scene lighting consistency
* Correct scale and placement
* Matching camera perspective
* Matching shadows and visual treatment

Do not generate a completely new video for every dealer. Use a template-first rendering workflow where fixed master scenes remain unchanged and only approved personalized layers are replaced.

### Step 8 — Preview and approval

Create a complete preview screen containing:

* Original dealer photograph
* Approved avatar pack
* Script
* Voice
* Language
* Master-video timeline
* Final personalized video preview
* Brand compliance score
* Avatar consistency score
* Audio-sync status
* Rendering status

Approval actions:

* Approve all
* Edit dealer details
* Edit dialogue
* Change voice
* Regenerate a pose
* Re-render selected scene
* Reject for correction
* Finalize video

Do not require regeneration of the full video when only one personalized field changes.

### Step 9 — Output variants

Generate platform-specific versions from the same approved campaign:

#### WhatsApp version

* Lightweight compressed MP4
* Mobile-first
* Fast download
* Shareable campaign link
* Optional personalized thumbnail
* Dealer-specific caption
* Suitable file size for WhatsApp sharing

#### Instagram Reel

* 9:16 vertical
* Platform-safe text zones
* Subtitle support
* Reel cover
* Suggested caption
* Hashtags
* Optional music-safe version

#### YouTube Short

* 9:16 vertical
* YouTube-safe title area
* Suggested title and description
* Thumbnail
* Subtitle file
* Campaign and dealer metadata

Allow one approved render to generate all three variants without rebuilding the campaign.

## Batch campaign management

Create a campaign dashboard for administrators managing many dealers.

Display:

* Total dealers
* Photo pending
* Avatar generation in progress
* Avatar awaiting approval
* Voice pending
* Rendering
* Render failed
* Finalized
* Shared
* Viewed
* Downloaded

Support:

* Bulk dealer import
* Bulk avatar generation
* Bulk rendering
* Retry failed jobs
* Filter by region, dealer, language or status
* Approve multiple dealer avatars
* Download selected outputs
* Send personalized links
* Export campaign report

Each dealer must still have an individual detail page for quality control.

## Campaign asset structure

Keep these assets separate:

### Fixed campaign assets

* Master video
* Music
* Brand logo
* Product visuals
* Background scenes
* Transitions
* Default script
* Art direction
* Approved outfits

### Personalized dealer assets

* Source photograph
* Avatar reference
* Avatar poses
* Dealer voice
* Personalized dialogue
* Dealer details
* End card
* Final rendered outputs

## Technical product behavior

Design this workflow around a provider-adapter architecture so EffySocial can use different providers for:

* Avatar generation
* Image-to-image consistency
* Image-to-video animation
* Lip-sync
* Voice cloning
* Translation
* Video composition
* Final rendering

The frontend should not depend directly on any one provider.

Use asynchronous job states for avatar generation, voice generation, scene rendering and final export. Include loading, queued, processing, failed, retrying and completed states.

Do not store generated media inside the application repository. Treat all campaign media as workspace-scoped media-library assets.

Preserve the existing EffySocial tenancy model:

Organization → Workspace → Campaign → Dealer Personalization Job → Avatar Assets → Voice Assets → Rendered Outputs

Every dealer asset and render must remain linked to:

* Workspace
* Campaign
* Dealer
* Master template
* Language
* Output platform
* Approval status

## Required screens and components

Add the following screens within the existing AI Studio and Campaign system:

1. Personalized Avatar Campaign overview
2. Master video and personalization-slot editor
3. Dealer onboarding form builder
4. Dealer import and batch-management screen
5. Dealer profile and uploaded-media screen
6. Avatar reference-pack generator
7. Avatar consistency and identity-lock panel
8. Personalized script editor
9. Voice and language configuration
10. Timeline-based personalization preview
11. Quality-control and approval screen
12. Multi-format export screen
13. Campaign progress dashboard
14. Individual dealer output page
15. Share and distribution panel

Use the existing EffySocial components, cards, tables, drawers, modals, tabs, status chips, progress states and responsive patterns. Do not create an unrelated visual system.

The final experience should make a technically complex personalization process feel like:

**Upload dealer → Approve avatar → Approve voice and dialogue → Preview → Render → Share**

The workflow must be scalable, consistent, brand-safe and suitable for producing hundreds or thousands of personalized dealer videos from one master campaign.
