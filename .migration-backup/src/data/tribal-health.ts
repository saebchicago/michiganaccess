/** Michigan's 12 federally recognized tribal nations and their health facilities.
 * These are sovereign health systems — not state facilities. */

export interface TribalHealthFacility {
  tribe: string;
  county: string;
  healthCenter: string;
  phone: string;
}

export const MI_TRIBAL_NATIONS: TribalHealthFacility[] = [
  { tribe: "Bay Mills Indian Community", county: "Chippewa", healthCenter: "Bay Mills Health Center", phone: "906-248-5527" },
  { tribe: "Grand Traverse Band of Ottawa and Chippewa", county: "Grand Traverse", healthCenter: "Tribal Health Center", phone: "231-534-7200" },
  { tribe: "Hannahville Indian Community", county: "Menominee", healthCenter: "Hannahville Health Center", phone: "906-466-2782" },
  { tribe: "Keweenaw Bay Indian Community", county: "Baraga", healthCenter: "Keweenaw Bay Tribal Health", phone: "906-353-4500" },
  { tribe: "Lac Vieux Desert Band of Lake Superior Chippewa", county: "Gogebic", healthCenter: "Lac Vieux Desert Health Center", phone: "906-358-4577" },
  { tribe: "Little River Band of Ottawa Indians", county: "Manistee", healthCenter: "Little River Band Health Dept", phone: "231-398-2561" },
  { tribe: "Little Traverse Bay Bands of Odawa Indians", county: "Emmet", healthCenter: "LTBB Health Dept", phone: "231-242-1600" },
  { tribe: "Match-E-Be-Nash-She-Wish Band (Gun Lake)", county: "Allegan", healthCenter: "Gun Lake Tribal Health", phone: "269-397-1780" },
  { tribe: "Nottawaseppi Huron Band of the Potawatomi", county: "Calhoun", healthCenter: "NHBP Health Center", phone: "269-729-4422" },
  { tribe: "Pokagon Band of Potawatomi", county: "Cass", healthCenter: "Pokagon Health Services", phone: "269-782-4141" },
  { tribe: "Saginaw Chippewa Indian Tribe", county: "Isabella", healthCenter: "Nimkee Health Center", phone: "989-775-4600" },
  { tribe: "Sault Ste. Marie Tribe of Chippewa Indians", county: "Chippewa", healthCenter: "Sault Tribe Health", phone: "906-632-5200" },
];
