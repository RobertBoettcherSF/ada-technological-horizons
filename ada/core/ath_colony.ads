with Interfaces;

--  The stubborn thousand and a spreading colony.
--
--  Lem paraphrases von Hoerner: self-liquidation is 65 chances in 100, and
--  the other causes are 35 in 100. Of a galactic billion, 990 million die
--  young. Of the ten million left, only 100,000, or 1,000, escape and then
--  last for hundreds of millions of years.
--
--  How many of those are alive now, and how far apart they are, uses the
--  blinking-galaxy share min(L / 15 billion years, 1) and the same declared
--  disc. The lifetime the visitor sets, from 100 million to 1 billion years,
--  is our choice inside Lem's "hundreds of millions".
--
--  The colony is ours. A modern disc about 100,000 light-years across is
--  crossed in hops. Hop time or hop distance of zero is not a journey.
package Ath_Colony is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Colony requires a binary64 Long_Float");

   subtype Status_Code is Interfaces.Integer_32;

   Ok           : constant Status_Code := 0;
   Non_Finite   : constant Status_Code := 1;
   Not_Positive : constant Status_Code := 2;

   Billion      : constant Long_Float := 1.0e9;
   Short_Lived  : constant Long_Float := 990.0e6;
   Self_In_100  : constant Long_Float := 65.0;
   Other_In_100 : constant Long_Float := 35.0;
   Life_Min     : constant Long_Float := 1.0e8;
   Life_Max     : constant Long_Float := 1.0e9;
   Cell_Count   : constant := 100;
   Star_Count   : constant := 36;
   Sample_Count : constant := 9;

   function Left_After return Long_Float;
   function Self_Deaths return Long_Float;
   function Other_Deaths return Long_Float;
   function Escapers (Choice : Positive) return Long_Float;

   --  Of the ten million that outlast the young deaths, all but the escapers
   --  still fade. Self + other + faded + escapers is the galactic billion.
   function Faded_Later (Choice : Positive) return Long_Float;

   --  True when the expected number alive now is at least one.
   function Shows_Count (Alive : Long_Float) return Boolean;

   --  When the expected number is below one, about 1 in this many.
   --  Zero when the count itself should be shown.
   function One_In (Alive : Long_Float) return Long_Float;

   --  A distance is shown only for at least one alive neighbour, and only
   --  when it is no larger than the galaxy (twice the disc radius).
   function Distance_Fits (Alive, Distance : Long_Float) return Boolean;

   procedure Survivors
     (Choice   : Positive;
      Years    : Long_Float;
      Alive    : out Long_Float;
      Distance : out Long_Float;
      Status   : out Status_Code);

   function Life_Of (Slider : Long_Float) return Long_Float;
   function Slider_Of (Years : Long_Float) return Long_Float;

   function Cell_Role (Index : Positive; Choice : Positive) return Interfaces.Integer_32;

   procedure Fill
     (Hop_Ly, Hop_Years : Long_Float;
      Hops, Fill_Years  : out Long_Float;
      Status            : out Status_Code);

   function Times_Over (Life_Years, Fill_Years : Long_Float) return Long_Float;

   procedure Star
     (Index : Positive;
      X, Y  : out Long_Float);

   function Generation
     (Index, Origin : Positive;
      Hop_Ly        : Long_Float) return Interfaces.Integer_32;

   function Sample_Years (Index : Positive) return Long_Float;
end Ath_Colony;
