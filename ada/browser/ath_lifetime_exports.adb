with Ath_Lifetime;

package body Ath_Lifetime_Exports is
   use type Ath_Lifetime.Status_Code;

   Stored_Mean : Long_Float := 0.0;
   Stored      : Ath_Lifetime.Fate_Values := (others => 0.0);

   function Ath_Lifetime_F64
     (P1, P2, P3, P4, D1, D2, D3, D4 : Long_Float)
      return Interfaces.Integer_32
   is
      Percentages   : constant Ath_Lifetime.Fate_Values := (P1, P2, P3, P4);
      Durations     : constant Ath_Lifetime.Fate_Values := (D1, D2, D3, D4);
      Contributions : Ath_Lifetime.Fate_Values;
      Mean          : Long_Float;
      Status        : Ath_Lifetime.Status_Code;
   begin
      Ath_Lifetime.Weighted_Mean
        (Percentages, Durations, Contributions, Mean, Status);
      if Status = Ath_Lifetime.Ok then
         Stored := Contributions;
         Stored_Mean := Mean;
      else
         Stored := (others => 0.0);
         Stored_Mean := 0.0;
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Lifetime_F64;

   function Ath_Lifetime_Mean return Long_Float is
   begin
      return Stored_Mean;
   end Ath_Lifetime_Mean;

   function Ath_Lifetime_Contribution
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 or else Index > Ath_Lifetime.Fate_Count then
         return 0.0;
      end if;
      return Stored (Integer (Index));
   end Ath_Lifetime_Contribution;
end Ath_Lifetime_Exports;
