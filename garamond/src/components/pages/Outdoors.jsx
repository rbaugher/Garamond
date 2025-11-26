import React, { useRef, useState, useEffect } from 'react';
import './Outdoors.css';

const CARD_DATA = [
  {
    id: 'backpacking',
    title: 'Backpacking Trips',
    desc: 'Multi-day routes, campsite selection, water sources and resupply points.',
    size: 'size-lg',
    images: ['/images/AT.jpg'],
    detailedContent: (
      <>
        <h3>Appalachian Trail (AT)</h3>
        <p><strong>Distance:</strong> 2,194 miles from Springer Mountain, Georgia to Mount Katahdin, Maine</p>
        <p><strong>Completion Time:</strong> Thru-hike typically takes 5-7 months; section hiking can span years</p>
        <p><strong>Best Season:</strong> Northbound (NOBO): March-April start; Southbound (SOBO): June-July start</p>
        
        <h4>Key Sections & Highlights</h4>
        <ul>
          <li><strong>Southern Appalachians (GA-NC-TN):</strong> Blood Mountain, Fontana Dam, Clingmans Dome, Great Smoky Mountains</li>
          <li><strong>Virginia:</strong> Longest state on trail (550+ miles), McAfee Knob, Dragon's Tooth, Shenandoah National Park</li>
          <li><strong>Mid-Atlantic (PA-MD-WV):</strong> Harper's Ferry (ATC headquarters), "Rocksylvania", Half Gallon Challenge</li>
          <li><strong>New England:</strong> White Mountains (NH), Presidential Range, Franconia Ridge, Mount Washington, Mahoosuc Notch</li>
          <li><strong>Maine:</strong> 100 Mile Wilderness, Baxter State Park, Mount Katahdin summit</li>
        </ul>

        <h4>Trail Towns & Resupply</h4>
        <p><strong>Major Towns:</strong> Franklin NC, Damascus VA, Hot Springs NC, Harper's Ferry WV, Port Clinton PA, Hanover NH, Monson ME</p>
        <p><strong>Resupply Strategy:</strong> Mail drops to post offices or purchase in trail towns every 3-5 days. Popular food: Pop-Tarts, instant mashed potatoes, peanut butter, instant coffee.</p>
        <p><strong>Zero Days:</strong> Plan rest days in Damascus, Harper's Ferry, and before/after White Mountains</p>

        <h4>Permits & Planning</h4>
        <p><strong>Permits Required:</strong> Great Smoky Mountains, Baxter State Park (100 Mile Wilderness), Shenandoah National Park</p>
        <p><strong>Shelters:</strong> Three-sided shelters spaced 8-12 miles apart. First-come, first-served. Tenting allowed at most shelters.</p>
        <p><strong>Budget:</strong> $1,000-1,500 per month including food, lodging, gear replacement, and entertainment</p>

        <h4>Essential Gear</h4>
        <ul>
          <li>Lightweight tent or hammock with rain fly</li>
          <li>20-30°F sleeping bag or quilt</li>
          <li>Water filtration system (Sawyer Squeeze popular choice)</li>
          <li>Trekking poles for rocky sections</li>
          <li>Base weight goal: 10-15 lbs</li>
        </ul>

        <h3>Pacific Crest Trail (PCT)</h3>
        <p><strong>Distance:</strong> 2,653 miles from Campo, California to Manning Park, British Columbia</p>
        <p><strong>Completion Time:</strong> Thru-hike typically takes 4-6 months</p>
        <p><strong>Best Season:</strong> Northbound: April-May start (timing critical for Sierra snowmelt and Washington before October snow)</p>

        <h4>Key Sections & Highlights</h4>
        <ul>
          <li><strong>Southern California (Campo-Kennedy Meadows):</strong> Desert hiking, San Jacinto, Big Bear, Wrightwood, Mount Baden-Powell</li>
          <li><strong>Sierra Nevada:</strong> 400+ miles of alpine terrain, Mount Whitney, Forester Pass (13,200 ft highest point), Evolution Valley, Tuolumne Meadows</li>
          <li><strong>Northern California:</strong> Lassen Volcanic, Burney Falls, Castle Crags, Mount Shasta views</li>
          <li><strong>Oregon:</strong> Crater Lake, Three Sisters Wilderness, Mount Hood, relatively flat and fast hiking</li>
          <li><strong>Washington:</strong> Goat Rocks, Glacier Peak Wilderness, North Cascades, Stehekin</li>
        </ul>

        <h4>Trail Towns & Resupply</h4>
        <p><strong>Major Towns:</strong> Idyllwild CA, Big Bear CA, Wrightwood CA, Kennedy Meadows CA, Lone Pine CA, Mammoth Lakes CA, South Lake Tahoe CA, Chester CA, Bend OR, Cascade Locks OR, Stehekin WA</p>
        <p><strong>Resupply Strategy:</strong> Longer carries required (5-7 days common in Sierra). Use bounce boxes for seasonal gear swaps. Mail drops essential for remote sections.</p>
        <p><strong>Hitchhiking:</strong> Common practice to reach trail towns from remote trailheads. Thumb out from highway crossings.</p>

        <h4>Permits & Planning</h4>
        <p><strong>PCT Long Distance Permit:</strong> Required for thru-hiking. Apply in November for next season (lottery system). Covers most of trail.</p>
        <p><strong>Additional Permits:</strong> Mount Whitney side trip, Canadian entry (for Manning Park finish), local wilderness permits as needed</p>
        <p><strong>Budget:</strong> $1,000-1,500 per month. California is most expensive due to higher town costs.</p>

        <h4>Special Considerations</h4>
        <p><strong>Water:</strong> Carry 4-6 liters in Southern California desert sections (30-40 mile dry stretches common). Use Guthook/FarOut app for water reports.</p>
        <p><strong>Snow:</strong> High Sierra snow can persist through June-July in heavy snow years. Ice axe and microspikes essential. Consider flip-flopping in heavy snow years.</p>
        <p><strong>Fire Closures:</strong> Increasingly common in California. Have contingency plans and follow trail updates.</p>

        <h4>Essential Gear</h4>
        <ul>
          <li>Ultralight tent (not hammock - limited trees in Sierra and desert)</li>
          <li>20°F quilt (cold nights at elevation)</li>
          <li>Ice axe and microspikes for Sierra (can mail home after)</li>
          <li>Sun protection: umbrella, sun hoody, zinc sunscreen</li>
          <li>Base weight goal: 8-12 lbs</li>
        </ul>

        <h3>General Long-Distance Trail Tips</h3>
        <ul>
          <li><strong>Training:</strong> Get comfortable hiking consecutive 15-20 mile days with a loaded pack</li>
          <li><strong>Start Slow:</strong> Build up miles gradually. First 2 weeks are hardest physically and mentally</li>
          <li><strong>Trail Names:</strong> Earn your trail name from other hikers through actions or quirks</li>
          <li><strong>Hiker Hunger:</strong> Expect to eat 4,000-6,000 calories per day once adapted</li>
          <li><strong>Mental Game:</strong> More mental than physical. Embrace discomfort and "hike your own hike"</li>
          <li><strong>Community:</strong> Join trail forums (WhiteBlaze for AT, PCT-L for PCT) and Facebook groups</li>
          <li><strong>Apps:</strong> Guthook/FarOut, Avenza Maps for navigation; Postholer for planning</li>
        </ul>
      </>
    )
  },
  {
    id: 'hiking',
    title: 'Hiking Trails',
    desc: 'Day hikes and local favorites with trailheads, distance and elevation details.',
    size: 'size-md',
    images: ['/images/BillyGoat.jpg'],
    detailedContent: (
      <>
        <h3>Best Hiking Trails Within 100 Miles of Washington, DC</h3>

        <h4>Shenandoah National Park (75 miles west)</h4>
        <p><strong>Old Rag Mountain</strong></p>
        <ul>
          <li><strong>Distance:</strong> 9.4 miles loop</li>
          <li><strong>Difficulty:</strong> Strenuous</li>
          <li><strong>Elevation Gain:</strong> 2,415 feet</li>
          <li><strong>Trailhead:</strong> Old Rag parking area, Syria, VA</li>
          <li><strong>Unique Features:</strong> Famous rock scramble at summit, 360-degree views from the top, one of the most popular hikes in the Mid-Atlantic. Requires use of hands for boulder scrambling. Best in spring/fall to avoid crowds.</li>
        </ul>

        <p><strong>Whiteoak Canyon & Cedar Run Circuit</strong></p>
        <ul>
          <li><strong>Distance:</strong> 8.5 miles loop</li>
          <li><strong>Difficulty:</strong> Moderate to Strenuous</li>
          <li><strong>Elevation Gain:</strong> 2,100 feet</li>
          <li><strong>Trailhead:</strong> Whiteoak Canyon parking, Syria, VA (Skyline Drive Mile 42.6)</li>
          <li><strong>Unique Features:</strong> Six waterfalls including 86-foot Whiteoak Falls, cascading pools, lush canyon environment. Can get crowded on weekends. Multiple stream crossings on Cedar Run side.</li>
        </ul>

        <p><strong>Hawksbill Mountain</strong></p>
        <ul>
          <li><strong>Distance:</strong> 2.9 miles out-and-back</li>
          <li><strong>Difficulty:</strong> Moderate</li>
          <li><strong>Elevation Gain:</strong> 700 feet</li>
          <li><strong>Trailhead:</strong> Hawksbill Gap parking, Skyline Drive Mile 45.6</li>
          <li><strong>Unique Features:</strong> Highest peak in Shenandoah at 4,050 feet, summit shelter with panoramic views, excellent for sunrise/sunset. Often see peregrine falcons.</li>
        </ul>

        <h4>Great Falls Park (15 miles from DC)</h4>
        <p><strong>Great Falls Circuit Trail</strong></p>
        <ul>
          <li><strong>Distance:</strong> 4.7 miles loop (VA side) or 5 miles loop (MD side)</li>
          <li><strong>Difficulty:</strong> Moderate</li>
          <li><strong>Elevation Gain:</strong> 300 feet</li>
          <li><strong>Trailhead:</strong> Great Falls Visitor Center (VA) or Great Falls Tavern (MD)</li>
          <li><strong>Unique Features:</strong> Spectacular waterfalls and rapids on the Potomac River, series of three overlooks, Billy Goat Trail Section A on MD side features challenging rock scrambling. Can connect to C&O Canal towpath for longer hikes.</li>
        </ul>

        <h4>Harpers Ferry, WV (60 miles northwest)</h4>
        <p><strong>Maryland Heights Trail</strong></p>
        <ul>
          <li><strong>Distance:</strong> 6.5 miles out-and-back</li>
          <li><strong>Difficulty:</strong> Strenuous</li>
          <li><strong>Elevation Gain:</strong> 1,465 feet</li>
          <li><strong>Trailhead:</strong> C&O Canal parking, Sandy Hook, MD</li>
          <li><strong>Unique Features:</strong> Best view of Harpers Ferry confluence, Civil War fortifications, rocky overlook 1,000 feet above town. Steep climbs. AT corridor nearby for longer hikes.</li>
        </ul>

        <p><strong>Loudoun Heights Trail</strong></p>
        <ul>
          <li><strong>Distance:</strong> 5.5 miles loop</li>
          <li><strong>Difficulty:</strong> Moderate to Strenuous</li>
          <li><strong>Elevation Gain:</strong> 1,250 feet</li>
          <li><strong>Trailhead:</strong> US Route 340 parking, Harpers Ferry, WV</li>
          <li><strong>Unique Features:</strong> Part of Appalachian Trail, overlooks Shenandoah and Potomac rivers, stone overlook at summit, historic Civil War earthworks.</li>
        </ul>

        <h4>Sugarloaf Mountain (40 miles northwest)</h4>
        <p><strong>Sugarloaf Mountain Trail</strong></p>
        <ul>
          <li><strong>Distance:</strong> 6.5 miles loop (combined trails)</li>
          <li><strong>Difficulty:</strong> Moderate</li>
          <li><strong>Elevation Gain:</strong> 800 feet</li>
          <li><strong>Trailhead:</strong> West View parking area, Dickerson, MD</li>
          <li><strong>Unique Features:</strong> Privately owned mountain open to public, monadnock (isolated peak), multiple overlooks including East View and West View, rock scrambles, excellent fall foliage. Relatively uncrowded.</li>
        </ul>

        <h4>Catoctin Mountain Park (50 miles north)</h4>
        <p><strong>Chimney Rock Trail</strong></p>
        <ul>
          <li><strong>Distance:</strong> 3.5 miles loop</li>
          <li><strong>Difficulty:</strong> Moderate</li>
          <li><strong>Elevation Gain:</strong> 600 feet</li>
          <li><strong>Trailhead:</strong> Park Central parking area, Thurmont, MD</li>
          <li><strong>Unique Features:</strong> Rock outcrop with views of Frederick Valley, Wolf Rock overlook, charcoal hearth sites from 19th century iron industry, connects to longer trail networks.</li>
        </ul>

        <h4>Sky Meadows State Park (50 miles west)</h4>
        <p><strong>Appalachian Trail to Ashby Gap</strong></p>
        <ul>
          <li><strong>Distance:</strong> 7.5 miles out-and-back</li>
          <li><strong>Difficulty:</strong> Moderate</li>
          <li><strong>Elevation Gain:</strong> 1,400 feet</li>
          <li><strong>Trailhead:</strong> Sky Meadows parking, Delaplane, VA</li>
          <li><strong>Unique Features:</strong> Pastoral meadows at start, connects to Appalachian Trail, Ambassador Whitehouse Trail offers views of Blue Ridge, open fields and mountain vistas. Great for wildflowers in spring.</li>
        </ul>

        <h4>Bull Run Mountains (40 miles west)</h4>
        <p><strong>Bull Run Mountains Natural Area Preserve</strong></p>
        <ul>
          <li><strong>Distance:</strong> Various trails, 3-7 miles</li>
          <li><strong>Difficulty:</strong> Easy to Moderate</li>
          <li><strong>Elevation Gain:</strong> 400-800 feet</li>
          <li><strong>Trailhead:</strong> Chapman's Mill parking, Thoroughfare Gap, VA</li>
          <li><strong>Unique Features:</strong> Historic Thoroughfare Gap (Civil War site), excellent bird watching, less crowded than Shenandoah, spring wildflowers, rocky ridgeline views.</li>
        </ul>

        <h4>Prince William Forest Park (30 miles south)</h4>
        <p><strong>South Valley Trail Loop</strong></p>
        <ul>
          <li><strong>Distance:</strong> 9.4 miles loop</li>
          <li><strong>Difficulty:</strong> Moderate</li>
          <li><strong>Elevation Gain:</strong> 900 feet</li>
          <li><strong>Trailhead:</strong> Pine Grove picnic area, Triangle, VA</li>
          <li><strong>Unique Features:</strong> Largest protected natural area near DC, Quantico Creek crossings, old-growth forest sections, Civilian Conservation Corps history, excellent for trail running. Less elevation than mountains but longer distance options.</li>
        </ul>

        <h4>Rock Creek Park (Inside DC)</h4>
        <p><strong>Valley Trail</strong></p>
        <ul>
          <li><strong>Distance:</strong> 4.5 miles one-way</li>
          <li><strong>Difficulty:</strong> Easy</li>
          <li><strong>Elevation Gain:</strong> Minimal</li>
          <li><strong>Trailhead:</strong> Pierce Mill or Rock Creek Nature Center</li>
          <li><strong>Unique Features:</strong> Urban wilderness within city limits, follows Rock Creek, connects to extensive trail network (20+ miles total), accessible by Metro, great for quick nature escapes and after-work hikes.</li>
        </ul>

        <h3>Hiking Tips for DC Area Trails</h3>
        <ul>
          <li><strong>Permits & Fees:</strong> Shenandoah requires park entrance fee ($30 vehicle, $15 individual). Great Falls and Prince William Forest also charge entrance fees. Many trails are free.</li>
          <li><strong>Crowds:</strong> Start early (7-8am) on weekends for popular trails like Old Rag and Great Falls. Weekdays significantly less crowded.</li>
          <li><strong>Weather:</strong> Summer can be hot and humid - bring extra water. Fall (October) offers best hiking with foliage and moderate temps. Winter hiking often requires microspikes for ice.</li>
          <li><strong>Parking:</strong> Old Rag and Whiteoak Canyon parking fills by 9am on weekends. Consider carpooling or arriving very early.</li>
          <li><strong>Water Sources:</strong> Carry 1-2 liters per person. Streams available on many trails but should be filtered.</li>
          <li><strong>Wildlife:</strong> Black bears in Shenandoah - make noise on trail. Copperhead snakes common in summer - watch where you step. Ticks active spring through fall - use tick checks.</li>
        </ul>
      </>
    )
  },
  {
    id: 'ragnar',
    title: 'Ragnar Races',
    desc: 'Relay race notes, team logistics, and training tips for multi-leg events.',
    size: 'size-md',
    images: ['/images/Ragnar.jpg'],
    detailedContent: (
      <>
        <h3>What is Ragnar?</h3>
        <p>Ragnar is a team relay race series where teams of 6-12 runners cover 180-200+ miles over the course of 24-36 hours. Each runner completes 3 legs, running through day and night while teammates rest, drive, and cheer from support vehicles.</p>
        
        <h3>Race Format</h3>
        <p><strong>Team Size:</strong> Standard teams have 12 runners (each runs ~15-18 miles total), while ultra teams have 6 runners (each runs ~30-36 miles total).</p>
        <p><strong>Legs:</strong> The course is divided into 36 legs of varying difficulty and distance (3-8 miles each). Runners are assigned legs based on difficulty ratings (Easy, Moderate, Hard, Very Hard).</p>
        
        <h3>Key Exchange Points</h3>
        <p><strong>Major Exchanges:</strong> Large exchange zones with food, bathrooms, showers, and sleeping areas. Perfect for extended rest breaks.</p>
        <p><strong>Minor Exchanges:</strong> Smaller transition points with basic facilities. Quick handoffs and van switches.</p>
        
        <h3>Training Tips</h3>
        <ul>
          <li><strong>Back-to-back runs:</strong> Practice running multiple times per day with rest in between to simulate the relay format</li>
          <li><strong>Night running:</strong> Train with a headlamp and reflective gear to prepare for overnight legs</li>
          <li><strong>Hill training:</strong> Many Ragnar courses feature significant elevation changes</li>
          <li><strong>Sleep deprivation:</strong> Mental preparation is key - you'll be running on minimal sleep</li>
        </ul>
        
        <h3>Essential Gear</h3>
        <ul>
          <li>Reflective vest and headlamp with red tail light (required for night legs)</li>
          <li>Multiple pairs of running shoes and socks</li>
          <li>Layers for temperature changes</li>
          <li>Anti-chafe products and blister care</li>
          <li>Portable phone charger</li>
          <li>Cooler with ice, hydration, and recovery snacks</li>
        </ul>
        
        <h3>Race Day Strategy</h3>
        <p><strong>Pacing:</strong> Start conservatively on Leg 1. You have two more legs ahead and don't want to blow up early.</p>
        <p><strong>Recovery:</strong> Use compression gear, foam roll, hydrate, and eat between legs. Sleep when you can.</p>
        <p><strong>Communication:</strong> Keep in touch with the other van about timing and exchange locations.</p>
        
        <h3>Popular Ragnar Races</h3>
        <p><strong>Ragnar Relay Series:</strong> Road races across scenic routes (Wasatch Back, Cape Cod, Northwest Passage, Reach the Beach, etc.)</p>
        <p><strong>Ragnar Trail:</strong> Off-road trail running loops at state parks and mountain venues</p>
        <p><strong>Ragnar Road:</strong> Point-to-point courses covering diverse terrain and elevations</p>
      </>
    )
  },
  {
    id: 'triathlon',
    title: 'Triathlon Training',
    desc: 'Swim/bike/run plans, brick workouts, and gear checklists for triathletes.',
    size: 'size-sm',
    images: ['/images/Triathlon.jpg'],
    detailedContent: (
      <>
        <h3>Triathlon Race Distances</h3>
        
        <h4>Sprint Distance</h4>
        <p><strong>Swim:</strong> 750 meters (0.47 miles) | <strong>Bike:</strong> 20 kilometers (12.4 miles) | <strong>Run:</strong> 5 kilometers (3.1 miles)</p>
        <p><strong>Average Completion Time:</strong> 1-2 hours</p>
        <p><strong>Best For:</strong> Beginners, first-time triathletes, testing speed, or busy training schedules</p>

        <h4>Olympic Distance (Standard)</h4>
        <p><strong>Swim:</strong> 1.5 kilometers (0.93 miles) | <strong>Bike:</strong> 40 kilometers (24.8 miles) | <strong>Run:</strong> 10 kilometers (6.2 miles)</p>
        <p><strong>Average Completion Time:</strong> 2.5-4 hours</p>
        <p><strong>Best For:</strong> Intermediate athletes, Olympic Games distance, most common competitive distance</p>

        <h4>Half Ironman (70.3)</h4>
        <p><strong>Swim:</strong> 1.9 kilometers (1.2 miles) | <strong>Bike:</strong> 90 kilometers (56 miles) | <strong>Run:</strong> 21.1 kilometers (13.1 miles - half marathon)</p>
        <p><strong>Average Completion Time:</strong> 5-7 hours</p>
        <p><strong>Best For:</strong> Experienced triathletes ready for long-course racing, stepping stone to full Ironman</p>

        <h4>Full Ironman (140.6)</h4>
        <p><strong>Swim:</strong> 3.8 kilometers (2.4 miles) | <strong>Bike:</strong> 180 kilometers (112 miles) | <strong>Run:</strong> 42.2 kilometers (26.2 miles - full marathon)</p>
        <p><strong>Average Completion Time:</strong> 10-17 hours (17-hour cutoff)</p>
        <p><strong>Best For:</strong> Elite endurance athletes, ultimate personal challenge, requires 6-12 months dedicated training</p>

        <h3>Key Triathlon Facts</h3>
        <ul>
          <li><strong>Origin:</strong> Modern triathlon began in 1974 in San Diego, California. First Ironman held in Hawaii in 1978.</li>
          <li><strong>Olympic Sport:</strong> Triathlon became an Olympic sport at Sydney 2000. Uses Olympic distance format.</li>
          <li><strong>Transition Times:</strong> T1 (swim-to-bike) and T2 (bike-to-run) transitions are counted in overall time. Called the "fourth discipline."</li>
          <li><strong>Wetsuit Regulations:</strong> Wetsuits allowed/required when water temperature is below 78°F (25.5°C). Illegal when above 84°F (29°C).</li>
          <li><strong>Drafting Rules:</strong> Drafting allowed in Olympic/elite races but illegal in most age-group races. Must maintain 7-meter distance behind cyclists.</li>
          <li><strong>Age Group Categories:</strong> Typically divided by 5-year age groups (20-24, 25-29, etc.). Compete for age group podium and Kona qualification slots.</li>
        </ul>

        <h3>Training Fundamentals</h3>
        
        <h4>Weekly Training Volume</h4>
        <p><strong>Sprint:</strong> 6-8 hours/week</p>
        <p><strong>Olympic:</strong> 8-12 hours/week</p>
        <p><strong>Half Ironman:</strong> 12-16 hours/week</p>
        <p><strong>Full Ironman:</strong> 15-20+ hours/week</p>

        <h4>Brick Workouts</h4>
        <p>Back-to-back workouts simulating race transitions, most commonly bike-to-run. Essential for adapting to running on tired legs. Practice fueling and transitions.</p>
        <ul>
          <li><strong>Short Brick:</strong> 30-45 min bike + 15-20 min run</li>
          <li><strong>Long Brick:</strong> 2-3 hour bike + 30-60 min run</li>
          <li><strong>Purpose:</strong> Trains legs to adapt from cycling to running motion</li>
        </ul>

        <h4>Weekly Training Structure</h4>
        <ul>
          <li><strong>3 Swims:</strong> One technique-focused, one interval, one endurance</li>
          <li><strong>3-4 Bike Rides:</strong> Mix of intervals, hills, and long rides</li>
          <li><strong>3 Runs:</strong> One intervals/speed, one tempo, one long run</li>
          <li><strong>1-2 Brick Workouts:</strong> Bike-to-run transitions</li>
          <li><strong>1-2 Strength/Mobility Sessions:</strong> Core, injury prevention</li>
          <li><strong>1 Rest Day:</strong> Complete rest or active recovery</li>
        </ul>

        <h3>Essential Gear Checklist</h3>

        <h4>Swim Gear</h4>
        <ul>
          <li>Wetsuit (if water temp permits)</li>
          <li>Swim goggles (clear for dark water, tinted for bright sun)</li>
          <li>Swim cap (usually provided by race)</li>
          <li>Tri suit or tri shorts (worn for entire race)</li>
        </ul>

        <h4>Bike Gear</h4>
        <ul>
          <li>Road bike or triathlon bike with aero bars</li>
          <li>Helmet (required, no helmet = disqualification)</li>
          <li>Cycling shoes and clipless pedals</li>
          <li>Water bottles and nutrition storage</li>
          <li>Spare tube, tire levers, CO2 or pump</li>
          <li>Bike computer/GPS watch</li>
        </ul>

        <h4>Run Gear</h4>
        <ul>
          <li>Running shoes (well-broken-in, never race in new shoes)</li>
          <li>Race belt for bib number</li>
          <li>Hat or visor for sun protection</li>
          <li>Sunglasses</li>
        </ul>

        <h4>Transition Gear</h4>
        <ul>
          <li>Towel to mark transition spot and dry feet</li>
          <li>Elastic laces for quick shoe changes</li>
          <li>Anti-chafe lubricant (Body Glide, Vaseline)</li>
          <li>Sunscreen</li>
        </ul>

        <h3>Nutrition & Hydration Strategy</h3>
        <ul>
          <li><strong>Before Race:</strong> High-carb meal 2-3 hours before start. Avoid fiber and new foods.</li>
          <li><strong>During Swim:</strong> No nutrition needed for distances under 70.3</li>
          <li><strong>During Bike:</strong> 200-300 calories per hour. Mix of gels, bars, and sports drink. Start fueling early.</li>
          <li><strong>During Run:</strong> 100-200 calories per hour. Gels easier to digest than solid food. Water at every aid station.</li>
          <li><strong>Practice Rule:</strong> Never try new nutrition on race day. Test everything in training.</li>
        </ul>

        <h3>Race Day Tips</h3>
        <ul>
          <li><strong>Arrive Early:</strong> 60-90 minutes before start for body marking, chip pickup, transition setup</li>
          <li><strong>Transition Setup:</strong> Lay out gear in order you'll use it. Bike shoes on bike, run shoes on towel.</li>
          <li><strong>Swim Start:</strong> Seed yourself appropriately. More aggressive swimmers start front/center. Calmer start at sides or back.</li>
          <li><strong>Pacing:</strong> Start conservative, especially the swim. You can't make up time if you blow up.</li>
          <li><strong>T1 (Swim-to-Bike):</strong> Take time to dry feet, apply sunscreen. Rushing leads to mistakes.</li>
          <li><strong>Bike Leg:</strong> Obey drafting rules. Call out when passing. Stay aero but stay safe.</li>
          <li><strong>T2 (Bike-to-Run):</strong> "Jelly legs" are normal. First mile will feel awkward - just settle in.</li>
          <li><strong>Run Leg:</strong> Break it into segments between aid stations. Walk through aid stations to consume fluids properly.</li>
        </ul>

        <h3>Common Beginner Mistakes</h3>
        <ul>
          <li><strong>Swimming Too Hard:</strong> Most blow up in first 400m. Calm breathing and steady pace crucial.</li>
          <li><strong>Expensive Gear Obsession:</strong> Fitness matters more than equipment. Used bike works fine for first races.</li>
          <li><strong>Skipping Brick Workouts:</strong> Running off the bike is unique sensation. Must practice.</li>
          <li><strong>Poor Transition Practice:</strong> Fumbling with gear wastes minutes. Practice T1 and T2.</li>
          <li><strong>New Gear on Race Day:</strong> New shoes, new nutrition, new chamois = disaster. Test everything.</li>
          <li><strong>Ignoring Bike Maintenance:</strong> Flat tire or mechanical can end your race. Learn basic repairs.</li>
        </ul>

        <h3>Popular Triathlon Series</h3>
        <ul>
          <li><strong>Ironman World Championship:</strong> Kona, Hawaii (October). Qualification required through Ironman events.</li>
          <li><strong>ITU/World Triathlon:</strong> Olympic distance series, pathway to Olympics</li>
          <li><strong>Challenge Family:</strong> European-based long-course series, alternative to Ironman</li>
          <li><strong>XTERRA:</strong> Off-road triathlon series (open water swim, mountain bike, trail run)</li>
          <li><strong>Rev3:</strong> North American race series with various distances</li>
        </ul>
      </>
    )
  },
  {
    id: 'parks',
    title: 'National Parks',
    desc: 'Highlights, permits, and best seasons for visiting the national parks.',
    size: 'size-md',
    images: ['/images/glacier.jpg'],
    detailedContent: (
      <>
        <h3>Yosemite National Park</h3>
        <p><strong>Location:</strong> California, Sierra Nevada</p>
        <p><strong>Best Time:</strong> May-September for full access; April-May for waterfalls</p>
        <p><strong>Highlights:</strong> Half Dome, El Capitan, Yosemite Falls, Glacier Point, Mariposa Grove</p>
        <p><strong>Permits:</strong> Required for Half Dome cables (lottery system), wilderness backpacking, and campground reservations</p>
        <p><strong>Tips:</strong> Book accommodations 6-12 months in advance. Use shuttle system in valley. Arrive early for parking.</p>

        <h3>Yellowstone National Park</h3>
        <p><strong>Location:</strong> Wyoming, Montana, Idaho</p>
        <p><strong>Best Time:</strong> April-May and September-October for wildlife; June-August for accessibility</p>
        <p><strong>Highlights:</strong> Old Faithful, Grand Prismatic Spring, Mammoth Hot Springs, Lamar Valley, Grand Canyon of Yellowstone</p>
        <p><strong>Permits:</strong> Backcountry camping requires permits. Fishing licenses needed.</p>
        <p><strong>Tips:</strong> Stay on boardwalks near thermal features. Wildlife viewing best at dawn/dusk. Plan for slow traffic and animal crossings.</p>

        <h3>Grand Canyon National Park</h3>
        <p><strong>Location:</strong> Arizona</p>
        <p><strong>Best Time:</strong> March-May and September-November for moderate weather; South Rim open year-round</p>
        <p><strong>Highlights:</strong> South Rim viewpoints, North Rim, Bright Angel Trail, rim-to-rim hikes, Colorado River rafting</p>
        <p><strong>Permits:</strong> Required for backcountry camping (lottery 4 months in advance), river trips, and overnight hikes</p>
        <p><strong>Tips:</strong> Descending is optional, ascending is mandatory. Carry 1 gallon water per person per day. North Rim closed in winter.</p>

        <h3>Zion National Park</h3>
        <p><strong>Location:</strong> Utah</p>
        <p><strong>Best Time:</strong> March-May and September-November; summer is hot but popular</p>
        <p><strong>Highlights:</strong> Angels Landing, The Narrows, Observation Point, Emerald Pools, Canyon Overlook</p>
        <p><strong>Permits:</strong> Angels Landing permit lottery required. Wilderness camping permits needed. Shuttle reservations recommended.</p>
        <p><strong>Tips:</strong> Check weather before The Narrows (flash flood danger). Shuttle required April-October. Rent water shoes/stick for Narrows.</p>

        <h3>Rocky Mountain National Park</h3>
        <p><strong>Location:</strong> Colorado</p>
        <p><strong>Best Time:</strong> June-September for Trail Ridge Road; May-June for wildflowers; September-October for elk</p>
        <p><strong>Highlights:</strong> Trail Ridge Road, Bear Lake, Longs Peak, Alpine Visitor Center, Moraine Park</p>
        <p><strong>Permits:</strong> Timed entry permits required May-October. Wilderness camping permits. Longs Peak permits in summer.</p>
        <p><strong>Tips:</strong> Altitude sickness common above 8,000 ft. Afternoon thunderstorms frequent in summer. Wildlife viewing best early morning.</p>

        <h3>Glacier National Park</h3>
        <p><strong>Location:</strong> Montana</p>
        <p><strong>Best Time:</strong> July-August for Going-to-the-Sun Road; June and September for fewer crowds</p>
        <p><strong>Highlights:</strong> Going-to-the-Sun Road, Grinnell Glacier, Many Glacier, Hidden Lake, Highline Trail</p>
        <p><strong>Permits:</strong> Vehicle reservations required for Going-to-the-Sun Road (May-September). Backcountry permits for camping.</p>
        <p><strong>Tips:</strong> Carry bear spray. Road typically fully open mid-July. Book lodging 13 months in advance. Dress in layers.</p>

        <h3>Acadia National Park</h3>
        <p><strong>Location:</strong> Maine</p>
        <p><strong>Best Time:</strong> September-October for fall foliage; June-August for warmth; May and October for fewer crowds</p>
        <p><strong>Highlights:</strong> Cadillac Mountain sunrise, Jordan Pond, Precipice Trail, Bass Harbor Head Lighthouse, carriage roads</p>
        <p><strong>Permits:</strong> Vehicle reservations required for Cadillac Summit Road May-October. Campground reservations fill fast.</p>
        <p><strong>Tips:</strong> Arrive by 5am for Cadillac sunrise parking. Popovers at Jordan Pond House. Free Island Explorer shuttle.</p>

        <h3>Olympic National Park</h3>
        <p><strong>Location:</strong> Washington</p>
        <p><strong>Best Time:</strong> July-September for mountains; year-round for rainforests and coast</p>
        <p><strong>Highlights:</strong> Hoh Rainforest, Hurricane Ridge, Ruby Beach, Sol Duc Falls, Quinault Rainforest</p>
        <p><strong>Permits:</strong> Wilderness camping permits. Some trailhead quotas in summer.</p>
        <p><strong>Tips:</strong> Park spans rainforest, mountains, and coast - plan multiple days. Bring rain gear. Check road conditions for Hurricane Ridge.</p>

        <h3>Arches National Park</h3>
        <p><strong>Location:</strong> Utah</p>
        <p><strong>Best Time:</strong> April-May and September-October for moderate temps; winter for solitude</p>
        <p><strong>Highlights:</strong> Delicate Arch, Landscape Arch, Devils Garden, Double Arch, Balanced Rock</p>
        <p><strong>Permits:</strong> Timed entry required April-October. Backcountry permits for overnight trips.</p>
        <p><strong>Tips:</strong> Delicate Arch hike best at sunset. Bring 1+ gallon water per person. Summer temps exceed 100°F. No shade on trails.</p>

        <h3>General National Park Tips</h3>
        <ul>
          <li><strong>Reservations:</strong> Book campsites, lodging, and permits as early as possible (often 6-13 months ahead)</li>
          <li><strong>Annual Pass:</strong> $80 America the Beautiful pass covers entrance to all national parks for one year</li>
          <li><strong>Leave No Trace:</strong> Pack out all trash, stay on trails, respect wildlife distances (25+ yards for most, 100+ for bears)</li>
          <li><strong>Weather:</strong> Mountain weather changes rapidly. Pack layers, rain gear, and sun protection</li>
          <li><strong>Altitude:</strong> Acclimate slowly at high-elevation parks. Drink extra water and watch for altitude sickness symptoms</li>
          <li><strong>Wildlife:</strong> Never feed animals. Store food properly. Carry bear spray in bear country</li>
        </ul>
      </>
    )
  }
];

export default function Outdoors() {
  const gridRef = useRef(null);
  const [openCard, setOpenCard] = useState(null);
  const [modalStyle, setModalStyle] = useState(null);
  const [surfaceStyle, setSurfaceStyle] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const startRectRef = useRef(null);
  const measurerRef = useRef(null);
  const [measurerCard, setMeasurerCard] = useState(null);
  const [measurerWidth, setMeasurerWidth] = useState(null);
  const [awaitingMeasure, setAwaitingMeasure] = useState(false);
  // refs to keep latest values for resize handler without re-registering listeners
  const modalStyleRef = useRef(null);
  const surfaceStyleRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpenCard(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // compute modal size/position to match outdoors-grid size and animate from card rect (FLIP)
  const openModalFor = (card, el) => {
    if (!el) {
      setModalStyle({ width: '90%', height: '70%' });
      setOpenCard(card);
      return;
    }
    const start = el.getBoundingClientRect();
    startRectRef.current = start;

    // On narrow screens, measure the modal content so we animate to the smallest content-fit size
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      // target width for mobile modal (small horizontal padding)
      const targetWidth = Math.round(Math.min(window.innerWidth - 32, window.innerWidth * 0.96));
      setMeasurerWidth(targetWidth);
      setMeasurerCard(card);
      setAwaitingMeasure(true);
      // we'll continue the FLIP flow from the measurement effect
      return;
    }

    const gridRect = gridRef.current ? gridRef.current.getBoundingClientRect() : { width: window.innerWidth };
    const finalWidth = Math.min(gridRect.width, window.innerWidth * 0.96);
    const finalHeight = Math.min(gridRect.height, window.innerHeight * 0.9);
    const finalLeft = Math.round((window.innerWidth - finalWidth) / 2);
  const finalTop = Math.round((window.innerHeight - finalHeight) / 2);

    // initial surface matches the card's on-screen rect (viewport coordinates)
    const initial = {
      left: Math.round(start.left),
      top: Math.round(start.top),
      width: Math.round(start.width),
      height: Math.round(start.height)
    };

    const final = {
      left: finalLeft,
      top: finalTop,
      width: Math.round(finalWidth),
      height: Math.round(finalHeight)
    };

    // set states to trigger render of the surface at initial rect
    setSurfaceStyle(initial);
    surfaceStyleRef.current = initial;
    setModalStyle(final);
    modalStyleRef.current = final;
    setOpenCard(card);
    setIsAnimating(true);

    // request frame then set surface to final so CSS transitions animate it
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSurfaceStyle(final);
      });
    });
  };

  const closeModal = () => {
    // quick fade out: clear openCard and surface
    setIsAnimating(false);
    setSurfaceStyle(null);
    surfaceStyleRef.current = null;
    setModalStyle(null);
    modalStyleRef.current = null;
    setOpenCard(null);
  };

  // respond to window resize/scroll so the modal/surface stays centered and sized to grid
  useEffect(() => {
    function getNavOffset() {
      try {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-height');
        if (!v) return 80;
        // strip non-digits
        const n = parseInt(v.replace(/[^0-9.-]+/g, ''), 10);
        return Number.isFinite(n) ? n : 80;
      } catch {
        return 80;
      }
    }
    function handleResize() {
      if (!openCard) return;
      const gridRect = gridRef.current ? gridRef.current.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      let finalWidth = Math.min(gridRect.width, window.innerWidth * 0.96);
      let finalHeight = Math.min(gridRect.height, window.innerHeight * 0.9);
      const finalLeft = Math.round((window.innerWidth - finalWidth) / 2);
      const isMobile = window.innerWidth <= 900;
      const navOffset = getNavOffset();
      // if mobile, cap height to viewport minus nav and padding so modal fits and becomes scrollable
      if (isMobile) {
        const mobileMax = Math.max(0, Math.round(window.innerHeight - navOffset - 24));
        finalHeight = Math.min(finalHeight, mobileMax);
        finalWidth = Math.min(finalWidth, Math.round(window.innerWidth - 32));
      }
      // for fixed positioning the top should be viewport-relative (no scrollY) — on mobile stick under nav
      const finalTop = isMobile ? Math.round(navOffset + 8) : Math.round((window.innerHeight - finalHeight) / 2);

      const final = { left: finalLeft, top: finalTop, width: Math.round(finalWidth), height: Math.round(finalHeight) };

      // update modal style and refs
      setModalStyle(final);
      modalStyleRef.current = final;

      // if the FLIP surface is present, move it to the new final rect so it transitions smoothly
      if (surfaceStyleRef.current) {
        setSurfaceStyle(final);
        surfaceStyleRef.current = final;
      }
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [openCard]);

  // when awaitingMeasure is true and measurerRef exists, measure content and continue setting up FLIP animation
  useEffect(() => {
    if (!awaitingMeasure || !measurerRef.current) return;

    function getNavOffset() {
      try {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-height');
        if (!v) return 80;
        const n = parseInt(v.replace(/[^0-9.-]+/g, ''), 10);
        return Number.isFinite(n) ? n : 80;
      } catch {
        return 80;
      }
    }

    const measured = measurerRef.current.getBoundingClientRect();
    let finalWidth = Math.round(measured.width);
    let finalHeight = Math.round(measured.height);
    const finalLeft = Math.round((window.innerWidth - finalWidth) / 2);
    const isMobile = window.innerWidth <= 900;
    const navOffset = getNavOffset();
    if (isMobile) {
      const mobileMax = Math.max(0, Math.round(window.innerHeight - navOffset - 24));
      finalHeight = Math.min(finalHeight, mobileMax);
      finalWidth = Math.min(finalWidth, Math.round(window.innerWidth - 32));
    }
    const finalTop = isMobile ? Math.round(navOffset + 8) : Math.round((window.innerHeight - finalHeight) / 2);

    const final = { left: finalLeft, top: finalTop, width: finalWidth, height: finalHeight };

    const start = startRectRef.current;
    const initial = {
      left: Math.round(start.left),
      top: Math.round(start.top),
      width: Math.round(start.width),
      height: Math.round(start.height)
    };

    // set states and trigger animation
    setSurfaceStyle(initial);
    surfaceStyleRef.current = initial;
    setModalStyle(final);
    modalStyleRef.current = final;
    setOpenCard(measurerCard);
    setIsAnimating(true);

    // animate to final
    requestAnimationFrame(() => requestAnimationFrame(() => setSurfaceStyle(final)));

    // clear measurer state (we measured already)
    setAwaitingMeasure(false);
    setMeasurerCard(null);
    setMeasurerWidth(null);
  }, [awaitingMeasure, measurerRef.current]);

  return (
    <div className="page-container outdoors-page">
      <header className="page-hero outdoors-hero">
        <h1>Outdoors</h1>
        <p>Trails, overnights and route notes — get outside and explore.</p>
      </header>

      <main className="page-content">
        

        <section className="outdoors-grid" ref={gridRef}>
          {CARD_DATA.map((c) => (
            <article key={c.id} className={`outdoor-card ${c.size}`} tabIndex={0} onClick={(e) => openModalFor(c, e.currentTarget)} onKeyDown={(e) => { if (e.key === 'Enter') openModalFor(c, e.currentTarget); }}>
              <div className="card-body">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </article>
          ))}
        </section>

        {/* hidden measurer used to compute content-fit size on mobile */}
        {measurerCard && (
          <div className="modal-measurer" ref={measurerRef} aria-hidden="true">
            <div style={{ width: measurerWidth }}>
              <div className="outdoors-modal">
                <div className="modal-content">
                  <div className="modal-gallery">
                    {measurerCard.images.map((src, i) => (
                      <img key={i} src={src} alt={`${measurerCard.title} ${i+1}`} />
                    ))}
                  </div>
                  <div className="modal-text">
                    <h2>{measurerCard.title}</h2>
                    {measurerCard.detailedContent ? measurerCard.detailedContent : <p>{measurerCard.desc}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal / pop-out */}
        {openCard && (
          <div className="outdoors-modal-overlay" onClick={closeModal} aria-hidden={isAnimating ? 'true' : 'false'}>
            {/* FLIP surface that animates from card rect to centered modal */}
            {surfaceStyle ? (
              <div
                className="outdoors-modal-surface"
                style={{
                  left: surfaceStyle.left,
                  top: surfaceStyle.top,
                  width: surfaceStyle.width,
                  height: surfaceStyle.height
                }}
                onTransitionEnd={() => {
                  // once surface finished animating to final size, allow full modal content to render inside
                  setIsAnimating(false);
                }}
              >
                {/* During the FLIP animation render a simple placeholder that exactly fills the surface to avoid layout jumps */}
                {isAnimating ? (
                  // show a simple black placeholder panel while the FLIP surface animates
                  <div className="surface-placeholder" />
                ) : (
                  // After animation, render the full modal content and let it fill the surface
                  <div className="outdoors-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${openCard.title} details`}>
                    <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
                    <div className="modal-content">
                      <div className="modal-gallery">
                        {openCard.images.map((src, i) => (
                          <img key={i} src={src} alt={`${openCard.title} ${i+1}`} />
                        ))}
                      </div>
                      <div className="modal-text">
                        <h2>{openCard.title}</h2>
                        {openCard.detailedContent ? openCard.detailedContent : <p>{openCard.desc}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // fallback: if FLIP surface isn't available render centered modal sized by modalStyle
              <div className="outdoors-modal" style={{ position: 'fixed', ...modalStyle }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${openCard.title} details`}>
                <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
                <div className="modal-content">
                  <div className="modal-gallery">
                    {openCard.images.map((src, i) => (
                      <img key={i} src={src} alt={`${openCard.title} ${i+1}`} />
                    ))}
                  </div>
                  <div className="modal-text">
                    <h2>{openCard.title}</h2>
                    {openCard.detailedContent ? openCard.detailedContent : <p>{openCard.desc}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
