# POC implementation for a digital twin of my small house using homeassistant and various MQTT devices.

![dashboard](images/ha_dashboard_01.png)

flaws:

-- by using forecast early hours become unavailble later in the day and light intensities become negative, likely due to naive interpolation
OK interesections do not consider clipPlane
-- page becomes unresponsive after a while (maybe after many text updates)
-- add radiation sensor through homeassistant (no radiation entity found in HA)
OK labels only work when vertical
OK introduce a second reference point so focus to that point can be preserved while navigating

possible improvements:

-- indicate rain
-- moonlight (and moonphase if somehow possible/feasible)
-- progressive shadowmap to show lightshed over a full day
OK add the gif exporter
