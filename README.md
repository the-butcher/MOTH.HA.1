# POC implementation for a digital twin of my small house using homeassistant and various MQTT devices.

![dashboard](images/ha_dashboard_01.png)

flaws:

OK interesections do not consider clipPlane
OK add radiation sensor through homeassistant (no radiation entity found in HA)
OK labels only work when vertical
OK introduce a second reference point so focus to that point can be preserved while navigating
OK store a wfocus point for each camera key and animate like camera pos
OK restore orbit center after animation
OK filter intersections by height only on instances having cli materials
-- by using forecast early hours become unavailble later in the day and light intensities become negative, likely due to naive interpolation
-- page becomes unresponsive after a while (maybe after many text updates)
-- reduce weather information to maybe a single symbol
OK add UI for "devices", pumps, switches, ...

possible improvements:

OK add the gif exporter
-- indicate rain
-- moonlight (and moonphase if somehow possible/feasible)
-- progressive shadowmap to show lightshed over a full day
